import React from 'react';
import axios from 'axios';
import Select from 'react-select';

 class App extends React.Component{

   constructor(props){
     super(props);
     this.state = { selectedOption: null, candidateOptions: [], data : 'Data goes here'};
   }

   componentDidMount = () => {
     let url = 'http://localhost:3000/candidates'
     return axios.get(url).then(response => {
       let candidateOptions = response.data.map(candidate => ({value: candidate.id, label: candidate.name}));
       this.setState({candidateOptions});
     });
   }

   handleChange = (selectedOption) => {
     this.setState({selectedOption});
   };

   getData = () => {
     let url = 'http://localhost:3000/votes'
     axios.get(url, { params: { candidate_id : this.state.selectedOption.value, precinct_id : 832800}}).then(response => {
       this.setState({ data: response.data[0].count});
     });
   }

   render(){
     const { selectedOption, candidateOptions } = this.state;

     return (
       <>
        <Select
          value = {selectedOption}
          onChange = {this.handleChange}
          options = {candidateOptions}
        />
        <button onClick = {this.getData}>Get Data</button>
        <div>{this.state.data}</div>
       </>
     );
   }
}

export default App;
