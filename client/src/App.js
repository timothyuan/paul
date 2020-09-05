import React from 'react';
import axios from 'axios';
import Select from 'react-select';
import {Pie} from 'react-chartjs-2';

 class App extends React.Component{

   constructor(props){
     super(props);
     this.state = {chart : null};
   }

   componentDidMount = () => {
     axios.get('http://localhost:3000/candidates').then(response => {
       let candidateOptions = response.data.map(candidate => ({value: candidate.id, label: candidate.name}));
       this.setState({candidateOptions});
     });
     axios.get('http://localhost:3000/precincts').then(response => {
       let precinctOptions = response.data.map(precinct => ({value: precinct.id, label: precinct.id+', '+precinct.city+', '+precinct.county}));
       this.setState({precinctOptions});
     });
   }

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
     let url = 'http://localhost:3000/votes'
     axios.get(url, { params: { candidate_id : this.state.candidate_id, precinct_id : this.state.precinct_id}}).then(response => {
       this.populate(response.data);
     });
   }

   populate = (data) => {
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
     chart.labels = data.map(result => result.name);
     chart.datasets[0].data = data.map(result => result.count);
     this.setState({chart: chart});
   }

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
        {this.state.chart && <Pie data={this.state.chart} />}
       </>
     );
   }
}

export default App;
