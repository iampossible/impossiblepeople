import React, { Component, Fragment } from "react";
import { Col, Button, Form, FormGroup, Label, Input } from "reactstrap";

import { userType, UserType } from "../UserType";

export default class CreateUser extends Component {
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
                  onChange={this.props.handleSelect}
                />
                Individual
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
                  onChange={this.props.handleSelect}
                />
                Organisation
              </Label>
            </FormGroup>
          </Col>
        </FormGroup>
        {this.props.inputData.typeOfUser == "organisation" ? (
          <Fragment>
            <FormGroup row>
              <Label for="organisationName" sm={4}>
                Organisation Name
              </Label>
              <Col sm={8}>
                <Input
                  type="text"
                  name="organisationName"
                  id="organisationName"
                  placeholder="Organisation name"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.organisationName}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="role" sm={4}>
                Role
              </Label>
              <Col sm={8}>
                <Input
                  type="text"
                  name="role"
                  id="role"
                  placeholder="Your role within the organisation"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.role}
                />
              </Col>
            </FormGroup>
          </Fragment>
        ) : (
          ""
        )}
        {this.props.inputData.typeOfUser == "volunteer" ||
        this.props.inputData.typeOfUser == "organisation" ? (
          <Fragment>
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
                  onChange={this.props.handleChange}
                  value={this.props.inputData.firstName}
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
                  onChange={this.props.handleChange}
                  value={this.props.inputData.lastName}
                />
              </Col>
            </FormGroup>
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
                  onChange={this.props.handleChange}
                  value={this.props.inputData.email}
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
                  onChange={this.props.handleChange}
                  value={this.props.inputData.password}
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
                  onChange={this.props.handleChange}
                />
                {this.props.inputData.validatePassword ? (
                  <span>
                    Your password and confirmation of it doesn't match{" "}
                  </span>
                ) : (
                  ""
                )}
              </Col>
            </FormGroup>
            <Button color="danger" onClick={this.props.handleCreateUser}>
              Submit
            </Button>
          </Fragment>
        ) : (
          ""
        )}
      </Form>
    );
  }
}
