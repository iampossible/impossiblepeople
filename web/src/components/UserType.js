import React, { Component } from "react";
import { Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
import FontAwesome from "react-fontawesome";

export class UserType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeOfUser: "",
      redirect: false
    };
    this.handleSelection = this.handleSelection.bind(this);
    this.handleSubmitRequest = this.handleSubmitRequest.bind(this);
    this.updateUserType = this.updateUserType.bind(this);
  }

  handleSelection(e) {
    this.setState({
      typeOfUser: e.target.value
    });
    // console.log(this.state);
  }
  handleSubmitRequest(e) {
    e.preventDefault();
    // console.log(this.state);
    //the parameter needs to be a JSON
    let interests = JSON.stringify({
      interests: this.props.interests
    });
    //add users interest
    fetch(`/api/user/interest`, {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: interests
    })
      //just for see the result of the operation...needs to be removed
      .then(response => response.json())
      .then(response => {
        this.updateUserType();
      })
      .catch(err => console.error(err));
  }
  updateUserType() {
    //update user type
    let typeOfUser = JSON.stringify({
      typeOfUser: this.state.typeOfUser
    });
    console.log(typeOfUser);
    fetch(`/api/user/userType`, {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: typeOfUser
    })
      //just for see the result of the operation...needs to be removed
      .then(response => response.json())
      .then(response => this.props.redirectOnSubmit(this.state.typeOfUser))
      .catch(err => console.error(err));
  }
  render() {
    return (
      <Form id="selectUserType">
        <FormGroup row>
          <Col sm={{ size: 3 }}>
            <Label>
              <p>I am registering as</p>
            </Label>
          </Col>
          <Col sm={{ size: 3 }}>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  id="volunteer"
                  onClick={this.handleSelection}
                  name="userType"
                  value="volunteer"
                />
                &nbsp;&nbsp; A Volunteer{" "}
                <FontAwesome
                  className="super-crazy-colors"
                  name="user-circle-o"
                  style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }}
                />
              </Label>
            </FormGroup>
          </Col>
          <Col sm={{ size: 3 }}>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  id="organisation"
                  onClick={this.handleSelection}
                  name="userType"
                  value="organisation"
                />
                &nbsp;&nbsp;An Organisation{" "}
                <FontAwesome
                  className="super-crazy-colors"
                  name="university"
                  style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }}
                />
              </Label>
            </FormGroup>
          </Col>
          <Col sm={{ size: 3 }}>
            <Button color="warning" onClick={this.handleSubmitRequest}>
              &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}
