import React from 'react';
import axios from 'axios';
import Select from 'react-select';
import {Pie} from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      voteChart : null,
      partyChart: null,
      raceChart: null,
      ageChart: null,
      voteChartOptions : null,
      partyChartOptions: null,
      raceChartOptions: null,
      ageChartOptions: null,
      votes: null,
      registered: null,
      demographics: [true, true, true]
    };
  };

  componentDidMount = () => {
    axios.get('https://paul-nodeserver.herokuapp.com/precincts').then(response => {
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
    this.setState({selectedFilter:null});
  };

  handleFilter = (selectedFilter) => {
    this.setState({selectedFilter});
  };

  getData = () => {
    axios.get('https://paul-nodeserver.herokuapp.com/votes', { params: {precinct_id : this.state.precinct_id}}).then(response => {
      var filter = this.filter(response.data);
      this.populateDemographics(response.data, filter);
      this.populateVotes(response.data, filter);
    });
  };

  filter = (data) => {
    let precincts = new Map();
    data.map(result => {
      if (!precincts.has(result.precinct_id)){
        precincts.set(result.precinct_id, [[result.name, result.count]]);
      } else {
        precincts.get(result.precinct_id).push([result.name, result.count]);
      }
    });
    if(!this.state.selectedFilter){
      return precincts;
    }
    for(let [precinct, candidates] of precincts){
      candidates.sort((a, b)=>b[1]-a[1]);
      let found = false;
      for (let i=0; i<this.state.selectedFilter.value; i++){
        if(candidates[i][0]=='Alex Lee'){
          found = true;
          break;
        }
      }
      if(!found){
        precincts.delete(precinct);
      }
    }
    return precincts;
  }

  populateVotes = (data, filter) => {
    // initialize chart
    let chart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384',
          '#FF944B',
          '#4A72D4',
          '#11EB81',
          '#F9C953',
          '#36A2EB',
          '#4BDBD9',
          '#F25AB9',
          '#A373FE'
        ]
      }]
    };

    // iterate through data
    let candidates = new Map();
    let votes = 0;
    data.map(result => {
      if(filter.has(result.precinct_id)){
        if (!candidates.has(result.name)){
          candidates.set(result.name, result.count);
        } else {
          candidates.set(result.name, candidates.get(result.name)+result.count);
        }
        votes+=result.count;
      }
    });
    this.setState({votes});

    // format title and calculate turnout
    let chartTitle = 'Votes for ';
    if(this.state.precinct_id==null){
      if(!this.state.selectedFilter){
        chartTitle += 'All Precincts: ';
      }else{
        chartTitle += `Filtered Precincts (${filter.size}): `;
      }
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
        },
        legend:{
          display: true,
          position: 'left'
        }
      }
    });
  };

  populateDemographics = (data, filter) => {
    // initialize charts
    let partyChart = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384',
          '#FF944B',
          '#4A72D4',
          '#11EB81',
          '#F9C953',
          '#36A2EB',
          '#4BDBD9'
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
          '#4A72D4',
          '#11EB81',
          '#F9C953',
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
          '#4A72D4',
          '#11EB81',
          '#F9C953'
        ]
      }]
    };

    // iterate through data
    let precincts = new Map();
    let party = new Map([
      ['Democratic',0],
      ['Green',0],
      ['Libertarian',0],
      ['Other',0],
      ['Republican',0],
      ['Unaffiliated',0],
      ['Peace and Freedom',0]
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
      if (!precincts.has(result.precinct_id)&&filter.has(result.precinct_id)) {
        party.set('Democratic',party.get('Democratic')+result.democratic);
        party.set('Green',party.get('Green')+result.green);
        party.set('Libertarian',party.get('Libertarian')+result.libertarian);
        party.set('Other',party.get('Other')+result.other);
        party.set('Republican',party.get('Republican')+result.republican);
        party.set('Unaffiliated',party.get('Unaffiliated')+result.unaffiliated);
        party.set('Peace and Freedom',party.get('Peace and Freedom')+result.peace_and_freedom);
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
    partyChart.labels = Array.from(party.keys());
    partyChart.datasets[0].data = Array.from(party.values());
    this.setState({partyChart: partyChart});
    this.setState({
      partyChartOptions:{
        plugins: {
          labels: {
            render:'value',
            fontColor: '#FFFFFF'
          }
        },
        title: {
          display: true,
          text: 'Party'
        },
        legend:{
          display: true,
          position: 'right'
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
        },
        legend:{
          display: true,
          position: 'left'
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
        },
        legend:{
          display: true,
          position: 'right'
        }
      }
    });
  };

  togglePercentage = () => {
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
        },
        legend:{
          display: true,
          position: 'left'
        }
      }
    });
    this.setState({
      partyChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          },
        },
        title: {
          display: true,
          text: 'Party'
        },
        legend:{
          display: true,
          position: 'right'
        }
      }
    });
    this.setState({
      raceChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          },
        },
        title: {
          display: true,
          text: 'Race'
        },
        legend:{
          display: true,
          position: 'left'
        }
      }
    });
    this.setState({
      ageChartOptions:{
        plugins:{
          labels:{
            render:type,
            fontColor:'#FFFFFF'
          },
        },
        title: {
          display: true,
          text: 'Age'
        },
        legend:{
          display: true,
          position: 'right'
        }
      }
    });
  };

  toggleDemographics = (vals) => {
    let demographics = [false, false, false];
    for(let v of vals.values()){
      demographics[v] = true;
    }
    this.setState({demographics});
  };

  render(){
    const { precinctOptions } = this.state;
    const filterOptions = [
      { value: 1, label: 'Top 1' },
      { value: 2, label: 'Top 2' },
      { value: 3, label: 'Top 3' },
      { value: 4, label: 'Top 4' },
      { value: 5, label: 'Top 5' },
      { value: 6, label: 'Top 6' },
      { value: 7, label: 'Top 7' },
      { value: 8, label: 'Top 8' }
    ]
    var styles = {
      left: {float:'left', width:'50%'},
      right: {float:'right', width:'50%'},
      flexbox: {display:'flex'},
      fill: {flex:1}
    };

    return (
      <>
        <div style={styles.flexbox}>
          <div style={styles.fill}>
            <Select
            isClearable = {true}
            placeholder = {'Select Precinct'}
            onChange = {this.handlePrecinct}
            options = {precinctOptions}
            />
          </div>
          <div style={styles.fill}>
            <Select
            isClearable = {true}
            placeholder = {'Filter by Alex Placement'}
            onChange = {this.handleFilter}
            options = {filterOptions}
            value = {this.state.selectedFilter}
            isDisabled = {this.state.precinct_id}
            />
          </div>
          <Button onClick = {this.getData}>Get Data</Button>
          <Button onClick = {this.togglePercentage} disabled = {!this.state.voteChartOptions}>Toggle Percentage</Button>
          <ToggleButtonGroup type='checkbox' onChange={this.toggleDemographics} defaultValue={[0,1,2]}>
            <ToggleButton value={0}>Race</ToggleButton>
            <ToggleButton value={1}>Age</ToggleButton>
            <ToggleButton value={2}>Party</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div style={styles.left}>
          {this.state.voteChart && <Pie data={this.state.voteChart} options={this.state.voteChartOptions}/>}
          {this.state.demographics[0] && this.state.raceChart && <Pie data={this.state.raceChart} options={this.state.raceChartOptions}/>}
        </div>
        <div style={styles.right}>
          {this.state.demographics[1] && this.state.ageChart && <Pie data={this.state.ageChart} options={this.state.ageChartOptions}/>}
          {this.state.demographics[2] && this.state.partyChart && <Pie data={this.state.partyChart} options={this.state.partyChartOptions}/>}
        </div>
      </>
    );
  }
}

export default App;
