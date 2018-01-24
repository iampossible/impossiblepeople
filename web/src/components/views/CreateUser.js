import React, { Component } from "react";
import {
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from "reactstrap";

export default class CreateUser extends Component {
  state = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    typeOfUser: ""
  };

  // handleCreateUser = () => {};
  onChange = e => {
    this.setState({
      typeOfUser: e.target.value
    });
  };
  render() {
    return (
      <Form>
        <FormGroup row>
          <Col sm={4}>
            <span>you are registering as</span>
          </Col>
          <Col sm={3}>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="typeOfUser"
                  value="volunteer"
                  onChange={this.onChange}
                />
                Volunteer
              </Label>
            </FormGroup>
          </Col>
          <Col sm={3}>
            <FormGroup check sm={3}>
              <Label check>
                <Input
                  type="radio"
                  name="typeOfUser"
                  value="organisation"
                  onChange={this.onChange}
                />
                Organisation
              </Label>
            </FormGroup>
          </Col>
        </FormGroup>
        {this.state.typeOfUser == "volunteer" || "" ? (
          <React.Fragment>
            <FormGroup row>
              <Label for="firtsName" sm={4}>
                First Name
              </Label>
              <Col sm={8}>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="First name"
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="lastName" sm={4}>
                Last Name
              </Label>
              <Col sm={8}>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last name"
                />
              </Col>
            </FormGroup>
          </React.Fragment>
        ) : (
          <FormGroup row>
            <Label for="lastName" sm={4}>
              Organiation Name
            </Label>
            <Col sm={8}>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Organisation name"
              />
            </Col>
          </FormGroup>
        )}
        <FormGroup row>
          <Label for="email" sm={4}>
            Email
          </Label>
          <Col sm={8}>
            <Input
              type="email"
              name="email"
              id="userRegistrationEmail"
              placeholder="e.g: you@someProvider.com"
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="password" sm={4}>
            Password
          </Label>
          <Col sm={8}>
            <Input
              type="password"
              name="password"
              id="userRegistrationPassword"
              placeholder="password"
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="password" sm={4}>
            Confirm Password
          </Label>
          <Col sm={8}>
            <Input
              type="password"
              name="confirmPassword"
              id="userRegistrationConfirmPassword"
              placeholder="password"
            />
          </Col>
        </FormGroup>
        <Button color="danger">Submit</Button>
      </Form>
    );
  }
}
