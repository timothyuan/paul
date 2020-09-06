import React from 'react';
import axios from 'axios';
import Select from 'react-select';
import {Pie} from 'react-chartjs-2';
import 'chartjs-plugin-labels';

class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      voteChart : null,
      voteChartOptions : null
    };
  };

  componentDidMount = () => {
    axios.get('http://localhost:3000/candidates').then(response => {
      let candidateOptions = response.data.map(candidate => ({value: candidate.id, label: candidate.name}));
      this.setState({candidateOptions});
    });
    axios.get('http://localhost:3000/precincts').then(response => {
      let precinctOptions = response.data.map(precinct => ({value: precinct.id, label: precinct.id+', '+precinct.city+', '+precinct.county}));
      this.setState({precinctOptions});
    });
  };

  handleCandidate = (selectedOption) => {
    if(selectedOption==null){
      this.setState({candidate_id: selectedOption});
    }else{
      this.setState({candidate_id: selectedOption.value});
    }
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
      this.populateVotes(response.data);
    });
  };

  populateVotes = (data) => {
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

    // format data
    let candidates = new Map();
    data.map(result => {
      if (!candidates.has(result.name)){
        candidates.set(result.name, result.count);
      } else {
        candidates.set(result.name, candidates.get(result.name)+result.count);
      }
    });
    chart.labels = Array.from(candidates.keys());
    chart.datasets[0].data = Array.from(candidates.values());
    this.setState({voteChart: chart});

    // format title
    let chartTitle = 'Votes for ';
    if(this.state.candidate_id==null){
      chartTitle += 'All Candidates at ';
    }else{
      chartTitle += this.state.candidateOptions.find(candidate => candidate.value==this.state.candidate_id).label+' at ';
    }
    if(this.state.precinct_id==null){
      chartTitle += 'All Precincts';
    }else{
      chartTitle += this.state.precinct_id;
    }
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
    })
  };

  render(){
    const { candidateOptions, precinctOptions } = this.state;

    return (
      <>
      <Select
      isClearable = {true}
      placeholder = {'Select Candidate'}
      onChange = {this.handleCandidate}
      options = {candidateOptions}
      />
      <Select
      isClearable = {true}
      placeholder = {'Select Precinct'}
      onChange = {this.handlePrecinct}
      options = {precinctOptions}
      />
      <button onClick = {this.getData}>Get Data</button>
      <button onClick = {this.toggle} disabled = {!this.state.voteChartOptions}>Toggle Percentage</button>
      {this.state.voteChart && <Pie data={this.state.voteChart} options={this.state.voteChartOptions}/>}
      </>
    );
  }
}

export default App;
