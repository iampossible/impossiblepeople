import React, { Component } from 'react';
import * as fakePost from './fakePost.json'
import { Row, Col } from 'reactstrap'
import Commnet from './Comment.js'



class Feed extends Component {
    constructor (props){
        super(props);
        this.state = {
            input : "",
            feed: []
        };
    }
    componentWillMount() {
        fetch('/api/feed',{
        method: 'GET',
        headers : {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        credentials :'same-origin'
      })
      .then(response => response.json())
      .then(response => {
          console.log(response)
            this.setState({
            feed: response
            })
        })
      .catch(err => console.error(err));
    }
    
    render() {

        return fakePost.map(function (fakeData, i,) {
            return (
                <Row className='feed'>
                    <div>
                        <img className='img-fluid' src={fakeData.author.imageSource || '../assets/images/profile-icon.png'} alt='profile' />
                        <Col key={i} className='feedusername'> {fakeData.author.username}</Col>
                    </div>
                    <Col key={i} className='feedBody'> {fakeData.content}</Col>
                    <Col key={i} xs="6" sm="4">
                        <p key={i} className='feedLocation'>location: {fakeData.location}</p>
                        <p key={i} className='feedinterest'>interest: {fakeData.category.name}</p>
                    </Col>
                    <Commnet />
                </Row>
            )
        })
    }
}
export default Feed