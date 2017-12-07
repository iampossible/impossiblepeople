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
    } else {
      interests.add(interestID);
      this.setState({interests});
    }
  }

  componentWillMount() {
    //load all the featured interests from the DB
    fetch(`/api/interest`, {
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 401)
          this.props.history.push("/")
        if (response.status > 399)
          return [];
        return response.json()
      })
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
      <div className={"buttons"}>
        {featuredInterest.map((interest, index) => {
          return (
            <Button
              className={this.state.interests.has(interest.interestID) ? "col-sm-6 col-xs-12 col-lg-3 col-md-3 interestButton btn btn-secondary selectedButton" : "col-sm-6 col-xs-12 col-lg-3 col-md-3 interestButton btn btn-secondary"}
              onClick={e => {
                this.handleSelection(e);
              }}
              key={interest.interestID}
              value={interest.interestID}
              disabled={this.state.buttonDisabled}
            >
              {interest.name}
            </Button>
          );
        })}

        <hr />

        <UserType
          interests={this.state.interests}
          redirectOnSubmit={this.redirectOnSubmit}
        />
      </div>
    );
  }
}
