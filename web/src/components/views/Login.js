import React, { Component, Fragment } from "react";
import { Row, Col, Button, Form, FormGroup, Input, Alert } from "reactstrap";
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
        {!this.props.forgotPasswordFlag ? (
          <Fragment>
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
              <Col sm={10} id="forgotPassword">
                <span onClick={this.props.toggleForgotPassword}>
                  Forgot my password
                </span>
              </Col>
              <Col sm={1} />
            </Row>
            <Row>
              <Col sm={1} />
              <Col sm={10}>
                <Button
                  id="signInSubmit"
                  onClick={this.props.handleLogin}
                  block>
                  Login
                </Button>
              </Col>
              <Col sm={1} />
            </Row>
          </Fragment>
        ) : (
          <Fragment>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="email"
                  name="recoverPasswordEmail"
                  id="recoverPasswordEmail"
                  placeholder="e.g: you@someProvider.com"
                  onChange={this.props.handleChange}
                  value={this.props.recoverPasswordEmail}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <Row>
              <Col sm={1} />
              <Col sm={10}>
                <Button
                  id="forgotPasswordSubmit"
                  onClick={this.props.handleForgotPassword}
                  block>
                  Submit
                </Button>
              </Col>
              <Col sm={1} />
            </Row>
            {this.props.forgotPasswordMessage ? (
              <Row>
                <Col sm={1} />
                <Col sm={10}>
                  <Alert color="success">
                    {this.props.forgotPasswordMessage}
                  </Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
          </Fragment>
        )}

        {this.props.loginError.length > 0 ? (
          <Row>
            <Col sm={1} />
            <Col sm={10} id="loginError">
              <Alert color="danger">
                {this.props.loginError.map((error, i) => (
                  <p key={i}>&ndash;{error}</p>
                ))}
              </Alert>
            </Col>
            <Col sm={1} />
          </Row>
        ) : (
          ""
        )}
        {this.props.error ? (
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <Alert color="danger"> {this.props.error}</Alert>
            </Col>
            <Col sm={1} />
          </Row>
        ) : (
          ""
        )}
      </Form>
    );
  }
}
