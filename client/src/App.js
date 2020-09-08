import React from 'react';
import axios from 'axios';
import Select from 'react-select';
import {Pie} from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

var styles = {
  left: {width:'50%', float:'left'},
  right: {width:'50%', float:'right'},
  flexbox: {display:'flex'},
  dropdown: {flex:1}
}

class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      voteChart : null,
      sexChart: null,
      raceChart: null,
      ageChart: null,
      voteChartOptions : null,
      sexChartOptions: null,
      raceChartOptions: null,
      ageChartOptions: null,
      votes: null,
      registered: null
    };
  };

  componentDidMount = () => {
    axios.get('http://localhost:3000/precincts').then(response => {
      let precinctOptions = response.data.map(precinct => ({value: precinct.id, label: precinct.id+', '+precinct.city+', '+precinct.county}));
      this.setState({precinctOptions});
    });
  };

  handlePrecinct = (selectedOption) => {
    if(selectedOption==null){
      this.setState({precinct_id: selectedOption});
    }else{
      this.setState({precinct_id: selectedOption.value});
    }
  };

  getData = () => {
    axios.get('http://localhost:3000/votes', { params: { candidate_id : this.state.candidate_id, precinct_id : this.state.precinct_id}}).then(response => {
      this.populateDemographics(response.data);
      this.populateVotes(response.data);
    });
  };

  populateVotes = (data) => {
    // initialize chart
    let chart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384',
          '#FF944B',
          '#FFCE56',
          '#6FFF76',
          '#73E9FE',
          '#36A2EB',
          '#7375FE',
          '#A373FE',
          '#FE73BD'
        ]
      }]
    };

    // iterate through data
    let candidates = new Map();
    let votes = 0;
    data.map(result => {
      if (!candidates.has(result.name)){
        candidates.set(result.name, result.count);
      } else {
        candidates.set(result.name, candidates.get(result.name)+result.count);
      }
      votes+=result.count;
    });
    this.setState({votes});

    // format title and calculate turnout
    let chartTitle = 'Votes for ';
    if(this.state.precinct_id==null){
      chartTitle += 'All Precincts: ';
    }else{
      chartTitle += 'Precinct ' + this.state.precinct_id + ': ';
    }
    chartTitle += (this.state.votes/this.state.registered*100).toFixed(2)+'% Turnout';

    // assign data to chart
    chart.labels = Array.from(candidates.keys());
    chart.datasets[0].data = Array.from(candidates.values());
    this.setState({voteChart: chart});
    this.setState({
      voteChartOptions:{
        plugins: {
          labels: {
            render:'value',
            fontColor: '#FFFFFF'
          }
        },
        title: {
          display: true,
          text: chartTitle
        }
      }
    });
  };

  populateDemographics = (data) => {
    // initialize charts
    let sexChart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384',
          '#FF944B',
          '#FFCE56'
        ]
      }]
    };
    let raceChart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384',
          '#FF944B',
          '#FFCE56',
          '#6FFF76',
          '#73E9FE',
          '#36A2EB'
        ]
      }]
    };
    let ageChart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384',
          '#FF944B',
          '#FFCE56',
          '#6FFF76',
          '#73E9FE'
        ]
      }]
    };

    // iterate through data
    let precincts = new Map();
    let sex = new Map([
      ['Male',0],
      ['Female',0],
      ['Unknown',0]
    ]);
    let race = new Map([
      ['African American',0],
      ['Asian',0],
      ['Caucasian',0],
      ['Hispanic',0],
      ['Native American',0],
      ['Uncoded',0]
    ]);
    let age = new Map([
      ['18-24',0],
      ['25-34',0],
      ['35-49',0],
      ['50-64',0],
      ['65+',0]
    ]);
    let registered = 0;
    data.map(result => {
      if (!precincts.has(result.precinct_id)) {
        sex.set('Male',sex.get('Male')+result.male);
        sex.set('Female',sex.get('Female')+result.female);
        sex.set('Unknown',sex.get('Unknown')+result.unknown);
        race.set('African American',race.get('African American')+result.african_american);
        race.set('Asian',race.get('Asian')+result.asian);
        race.set('Caucasian',race.get('Caucasian')+result.caucasian);
        race.set('Hispanic',race.get('Hispanic')+result.hispanic);
        race.set('Native American',race.get('Native American')+result.native_american);
        race.set('Uncoded',race.get('Uncoded')+result.uncoded);
        age.set('18-24',age.get('18-24')+result.a);
        age.set('25-34',age.get('25-34')+result.b);
        age.set('35-49',age.get('35-49')+result.c);
        age.set('50-64',age.get('50-64')+result.d);
        age.set('65+',age.get('65+')+result.e);
        precincts.set(result.precinct_id);
        registered+=result.male+result.female+result.unknown;
      }
    });

    // assign data to chart
    this.setState({registered});
    sexChart.labels = Array.from(sex.keys());
    sexChart.datasets[0].data = Array.from(sex.values());
    this.setState({sexChart: sexChart});
    this.setState({
      sexChartOptions:{
        plugins: {
          labels: {
            render:'value',
            fontColor: '#FFFFFF'
          }
        },
        title: {
          display: true,
          text: 'Sex'
        }
      }
    });
    raceChart.labels = Array.from(race.keys());
    raceChart.datasets[0].data = Array.from(race.values());
    this.setState({raceChart: raceChart});
    this.setState({
      raceChartOptions:{
        plugins: {
          labels: {
            render:'value',
            fontColor: '#FFFFFF'
          }
        },
        title: {
          display: true,
          text: 'Race'
        }
      }
    });
    ageChart.labels = Array.from(age.keys());
    ageChart.datasets[0].data = Array.from(age.values());
    this.setState({ageChart: ageChart});
    this.setState({
      ageChartOptions:{
        plugins: {
          labels: {
            render:'value',
            fontColor: '#FFFFFF'
          }
        },
        title: {
          display: true,
          text: 'Age'
        }
      }
    });
  };

  toggle = () => {
    let type = 'value';
    if (this.state.voteChartOptions.plugins.labels.render === 'value'){
      type = 'percentage';
    }
    this.setState({
      voteChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          }
        }
      }
    });
    this.setState({
      sexChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          }
        }
      }
    });
    this.setState({
      raceChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          }
        }
      }
    });
    this.setState({
      ageChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          }
        }
      }
    });
  };

  render(){
    const { precinctOptions } = this.state;

    return (
      <>
        <div style={styles.flexbox}>
          <div style={styles.dropdown}>
            <Select
            isClearable = {true}
            placeholder = {'Select Precinct'}
            onChange = {this.handlePrecinct}
            options = {precinctOptions}
            />
          </div>
          <Button onClick = {this.getData}>Get Data</Button>
          <Button onClick = {this.toggle} disabled = {!this.state.voteChartOptions}>Toggle Percentage</Button>
        </div>
        <div style={styles.left}>
          {this.state.voteChart && <Pie data={this.state.voteChart} options={this.state.voteChartOptions}/>}
          {this.state.sexChart && <Pie data={this.state.sexChart} options={this.state.sexChartOptions}/>}
        </div>
        <div style={styles.right}>
          {this.state.raceChart && <Pie data={this.state.raceChart} options={this.state.raceChartOptions}/>}
          {this.state.ageChart && <Pie data={this.state.ageChart} options={this.state.ageChartOptions}/>}
        </div>
      </>
    );
  }
}

export default App;
