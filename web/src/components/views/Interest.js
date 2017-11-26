import React, { Component } from "react";
import { Button } from "reactstrap";
import { UserType } from "../UserType";
export default class Interest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //to hold all the featured interests from the DB
      featuredInterest: [],
      //to hold the interests that the user picks
      interests: new Set()
    };
  }

  //to handle the selection when the button is clicked
  handleSelection(evt) {
    //get the interestID from the button selected/clicked
    let interestID = evt.target.value;
    let interests = new Set(this.state.interests);
    if(interests.has(interestID)){
      interests.delete(interestID);
      this.setState({interests});
      evt.target.className='col-sm-6 col-xs-12 col-lg-3 col-md-3 interestButton btn btn-secondary';      
    } else {
      interests.add(interestID);
      this.setState({interests});
      evt.target.className='col-sm-6 col-xs-12 col-lg-3 col-md-3 interestButton btn btn-secondary selectedButton';
    }
  }

  componentWillMount() {
    //load all the featured interests from the DB
    fetch(`/api/interest`, {
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(response => {
        this.setState({
          featuredInterest: response
        });
      });
  }
  redirectOnSubmit = (userType) => {
    let user = Object.assign({}, this.props.user, {userType: userType}); 
    this.props.setUser(user);
    this.props.history.push("/feed");
  }
  render() {
    const { featuredInterest } = this.state;
  
    return (
      <div className={'buttons'}>
        {featuredInterest.map((interest, index) => {
          return (
            <Button
              className ={'col-sm-6 col-xs-12 col-lg-3 col-md-3 interestButton' }
              onClick={e => {
                this.handleSelection(e);
              }}
              value={interest.interestID}
              key={interest.interestID}
            >
              {interest.name}
            </Button>
          );
        })}
        <hr />
        <UserType interests={this.state.interests} redirectOnSubmit={this.redirectOnSubmit} />
      </div>
    );
  }
}
