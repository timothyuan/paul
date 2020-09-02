import React from 'react';
import axios from 'axios';

 class App extends React.Component{
   constructor(props){
     super(props);
     this.state = { data : 'Data goes here'};
     this.getData = this.getData.bind(this)
   }

   getData(){
     let url = 'http://localhost:3000/votes'
     axios.get(url, { params: { candidate_id : 2, precinct_id : 832800}}).then(response => {
       console.log(response.data)
       this.setState({ data: response.data[0].count});
       console.log(this.state.data)
     });
   }

   render(){
     return (
       <>
         <button onClick = {this.getData}>Get Data</button>
         <div>{this.state.data}</div>
       </>
     );
   }
}

export default App;
