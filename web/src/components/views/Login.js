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

export default class Login extends Component {
  state = {
    email: "",
    password: ""
  };

  // handleCreateUser = () => {};
  // onChange = e => {
  //   this.setState({
  //     typeOfUser: e.target.value
  //   });
  // };
  render() {
    return (
      <Form>
        <FormGroup row>
          <Label for="email" sm={4}>
            Email
          </Label>
          <Col sm={8}>
            <Input
              type="email"
              name="email"
              id="userLoginEmail"
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
              id="userLoginPassword"
              placeholder="password"
            />
          </Col>
        </FormGroup>
        <Button color="danger">Login</Button>
      </Form>
    );
  }
}
