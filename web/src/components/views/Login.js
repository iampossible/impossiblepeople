import React, { Component } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert
} from "reactstrap";
import FacebookLogin from "react-facebook-login";

export default class Login extends Component {
  render() {
    return (
      <Form>
        <FormGroup row>
          <Label for="logInEmail" sm={3}>
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
          <Label for="logInPassword" sm={3}>
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
          </Col>
        </FormGroup>
        <Row>
          <Col sm={3} />
          <Col sm={8}>
            {this.props.error ? (
              <Alert color="danger"> {this.props.error}</Alert>
            ) : (
              ""
            )}
          </Col>
          <Col sm={1} />
        </Row>
        <Row>
          <Col sm={3} />
          <Col sm={8}>
            <Button color="danger" onClick={this.props.handleLogin} block>
              Login
            </Button>
          </Col>
          <Col sm={1} />
        </Row>
        <Row className="orLoginWithFacebook">
          <Col sm={3} />
          <Col sm={8} style={{ textAlign: "center" }}>
            <p>&mdash;&mdash;&mdash;&nbsp;OR&nbsp;&mdash;&mdash;&mdash;</p>
          </Col>
          <Col sm={1} />
        </Row>
        <Row>
          <Col sm={3} />
          <Col sm={8} xs={12} id="loginFacebook">
            <FacebookLogin
              appId="138462666798513"
              autoLoad={false}
              icon="fa-facebook fa-lg"
              fields="name,email,picture,friends"
              callback={this.props.responseFacebook}
            />
          </Col>
          <Col sm={1} />
        </Row>
      </Form>
    );
  }
}
