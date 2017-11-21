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
      interests: []
    };
  }

  //to handle the selection when the button is clicked
  handleSelection(evt) {
    //get the interestID from the button selected/clicked
    let interestID = evt.target.value;
    //make the button disabled once it is selected
    if (evt.target.disabled) {
      evt.target.disabled = false;
    } else {
      evt.target.disabled = true;
    }

    //may not be needed as the button with the id is disabled
    //but in case
    let selectedInterests = this.state.interests;
    if (!selectedInterests.includes(interestID)) {
      selectedInterests.push(interestID);
    }
    this.setState({
      interests: selectedInterests
    });
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
  redirectOnSubmit = userType => {
    let user = Object.assign({}, this.props.location.state.user, {
      userType: userType
    });
    this.props.history.push("/feed", { user });
  };
  render() {
    const { featuredInterest } = this.state;

    return (
      <div className={"buttons"}>
        {featuredInterest.map((interest, index) => {
          return (
            <Button
              className={"col-sm-6 col-xs-12 col-lg-3 col-md-3"}
              onClick={e => {
                this.handleSelection(e);
              }}
              value={interest.interestID}
              disabled={this.state.buttonDisabled}
            >
              {interest.name}
            </Button>
          );
        })}

        <hr />

        <UserType interests={this.state.interests} />
      </div>
    );
  }
}
