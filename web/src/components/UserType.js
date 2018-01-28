import React, { Component } from "react";
import { Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
import FontAwesome from "react-fontawesome";

export class UserType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userType: "",
      redirect: false
    };
    this.handleSelection = this.handleSelection.bind(this);
    this.handleSubmitRequest = this.handleSubmitRequest.bind(this);
    this.updateUserType = this.updateUserType.bind(this);
  }

  handleSelection(e) {
    this.setState({
      userType: e.target.value
    });
  }
  handleSubmitRequest(e) {
    e.preventDefault();
    //the parameter needs to be a JSON
    let interests = JSON.stringify({
      interests: [...this.props.interests]
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
    fetch(`/api/user/userType`, {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userType: this.state.userType
      })
    })
      //just for see the result of the operation...needs to be removed
      .then(response => response.json())
      .then(response => this.props.redirectOnSubmit(this.state.userType))
      .catch(err => console.error(err));
  }
  render() {
    return (
      <Form id="selectUserType">
        <FormGroup row>
          <Col sm={1} />
          <Col sm={2} xs={12} id="userTypeText">
            <Label>
              <p>I am registering as</p>
            </Label>
          </Col>
          <Col sm={3} id="volunteerUserType">
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  id="volunteer"
                  onClick={this.handleSelection}
                  name="userType"
                  value="volunteer"
                />
                &nbsp;&nbsp; A Volunteer&nbsp;
                <FontAwesome
                  className="super-crazy-colors"
                  name="user-circle-o"
                  style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }}
                />
              </Label>
            </FormGroup>
          </Col>
          <Col sm={3} xs={12} id="organisationUserType">
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  id="organisation"
                  onClick={this.handleSelection}
                  name="userType"
                  value="organisation"
                />
                &nbsp;&nbsp;An Organisation&nbsp;&nbsp;
                <FontAwesome
                  className="super-crazy-colors"
                  name="university"
                  style={{ textShadow: "0 1px 0 rgba(0, 0, 0, 0.1)" }}
                />
              </Label>
            </FormGroup>
          </Col>
          <Col sm={2}>
            <Button
              id="submitUserTypeButton"
              onClick={this.handleSubmitRequest}>
              &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}
