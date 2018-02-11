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
      <Form id="signinForm">
        <Row>
          <Col sm={1} />
          <Col sm={10} xs={12} id="loginFacebook">
            <FacebookLogin
              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
              autoLoad={false}
              icon="fa-facebook fa-lg"
              fields="name,email,picture,friends"
              textButton="Continue with Facebook"
              callback={this.props.responseFacebook}
            />
          </Col>
          <Col sm={1} />
        </Row>
        {this.props.facebookLoginError ? (
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <Alert color="danger"> {this.props.facebookLoginError}</Alert>
            </Col>
            <Col sm={1} />
          </Row>
        ) : null}
        <Row className="orLoginWithFacebook">
          <Col sm={1} />
          <Col sm={10} style={{ textAlign: "center" }}>
            <p>&mdash;&mdash;&mdash;&nbsp;OR&nbsp;&mdash;&mdash;&mdash;</p>
          </Col>
          <Col sm={1} />
        </Row>
        <FormGroup row>
          <Col sm={1} />
          <Col sm={10}>
            <Input
              type="email"
              name="logInEmail"
              id="userLoginEmail"
              placeholder="e.g: you@someProvider.com"
              onChange={this.props.handleChange}
              value={this.props.logInEmail}
            />
          </Col>
          <Col sm={1} />
        </FormGroup>
        <FormGroup row>
          <Col sm={1} />
          <Col sm={10}>
            <Input
              type="password"
              name="logInPassword"
              id="userLoginPassword"
              placeholder="password"
              onChange={this.props.handleChange}
              value={this.props.logInPassword}
            />
          </Col>
          <Col sm={1} />
        </FormGroup>
        <Row>
          <Col sm={1} />
          <Col sm={10}>
            {this.props.error ? (
              <Alert color="danger"> {this.props.error}</Alert>
            ) : (
              ""
            )}
          </Col>
          <Col sm={1} />
        </Row>
        <Row>
          <Col sm={1} />
          <Col sm={10}>
            <Button id="signInSubmit" onClick={this.props.handleLogin} block>
              Login
            </Button>
          </Col>
          <Col sm={1} />
        </Row>
      </Form>
    );
  }
}
