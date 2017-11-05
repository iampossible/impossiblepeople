import React , { Component} from 'react'
import {Input , Button , Col} from 'reactstrap'

class Comment extends Component {
    constructor (props){
        super (props)
        this.state = {
            input : "",
            submit: false
        }
    };
    handleChange = (event) => {
        this.setState({input: event.target.value})
    }
    handleClick = (event) => {
        this.setState({
            submit: true
        })
        return (alert(this.state.input))
    }

render(){
    return(
        <div >
        <Input type="text" placeholder="write your comment" input={this.state.input} onChange={this.handleChange} />
        <Button type="submit" onClick={this.handleClick} >Post</Button>
        </div>
    )
}
}
export default Comment