import React from 'react';
import axios from 'axios';
import Select from 'react-select';

 class App extends React.Component{

   constructor(props){
     super(props);
     this.state = {data : 'Data goes here'};
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
       this.setState({ data: response.data[0].count});
     });
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
        <div>{this.state.data}</div>
       </>
     );
   }
}

export default App;
