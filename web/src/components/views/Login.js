import React, { Component } from "react";
import { Col, Button, Form, FormGroup, Label, Input } from "reactstrap";

export default class Login extends Component {
  render() {
    return (
      <Form>
        <FormGroup row>
          <Label for="logInEmail" sm={4}>
            Email
          </Label>
          <Col sm={8}>
            <Input
              type="email"
              name="logInEmail"
              id="userLoginEmail"
              placeholder="e.g: you@someProvider.com"
              onChange={this.props.handleChange}
              value={this.props.logInEmail}
            />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="logInPassword" sm={4}>
            Password
          </Label>
          <Col sm={8}>
            <Input
              type="password"
              name="logInPassword"
              id="userLoginPassword"
              placeholder="password"
              onChange={this.props.handleChange}
              value={this.props.logInPassword}
            />
            <p>{this.props.error ? this.props.error : ""}</p>
          </Col>
        </FormGroup>
        <Button color="danger" onClick={this.props.handleLogin}>
          Login
        </Button>
      </Form>
    );
  }
}
