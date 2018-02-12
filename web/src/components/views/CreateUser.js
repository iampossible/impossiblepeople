import React, { Component, Fragment } from "react";
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

export default class CreateUser extends Component {
  render() {
    return (
      <Form id="registrationForm">
        {this.props.inputData.userType === "volunteer" ? (
          <Fragment>
            <Row>
              <Col sm={1} />
              <Col sm={10} xs={12} id="signUpFacebook">
                <FacebookLogin
                  appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                  autoLoad={false}
                  icon="fa-facebook fa-lg"
                  fields="name,email,picture,friends"
                  callback={this.props.responseFacebook}
                  textButton="Sign Up with Facebook"
                />
              </Col>
              <Col sm={1} />
            </Row>
            <Row className="orLoginWithFacebook">
              <Col sm={2} />
              <Col sm={8} style={{ textAlign: "center" }}>
                <p>&mdash;&mdash;&mdash;&nbsp;OR&nbsp;&mdash;&mdash;&mdash;</p>
              </Col>
              <Col sm={2} />
            </Row>
          </Fragment>
        ) : (
          ""
        )}
        {this.props.facebookLoginError ? (
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <Alert color="danger"> {this.props.facebookLoginError}</Alert>
            </Col>
            <Col sm={1} />
          </Row>
        ) : null}
        <Row>
          <Col sm={1} />
          <Col sm={10}>
            <p>Sign Up with email</p>
          </Col>
          <Col sm={1} />
        </Row>
        {this.props.inputData.userType === "organisation" ? (
          <Fragment>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="text"
                  name="organisationName"
                  id="organisationName"
                  placeholder="Organisation name"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.organisationName}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="text"
                  name="role"
                  id="role"
                  placeholder="Your role within the organisation"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.role}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
          </Fragment>
        ) : (
          ""
        )}
        {this.props.inputData.userType === "volunteer" ||
        this.props.inputData.userType === "organisation" ? (
          <Fragment>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="First name"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.firstName}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last name"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.lastName}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="email"
                  name="email"
                  id="userRegistrationEmail"
                  placeholder="e.g: you@someProvider.com"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.email}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="password"
                  name="password"
                  id="userRegistrationPassword"
                  placeholder="password"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.password}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Col sm={10}>
                <Input
                  type="password"
                  name="confirmPassword"
                  id="userRegistrationConfirmPassword"
                  placeholder="Confirm Password"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.confirmPassword}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>

            <FormGroup row>
              <Col sm={1} />
              <Col sm={10} id="userAggrementCheckbox">
                <Label check>
                  <Input
                    type="checkbox"
                    onClick={this.props.handleUserAgreement}
                  />&nbsp;&nbsp;&nbsp; I have read the
                  <a href="/userAgreement"> user aggrement </a> and agree
                </Label>
              </Col>
              <Col sm={1} />
            </FormGroup>

            <Row>
              <Col sm={1} />
              <Col sm={10}>
                <Button
                  disabled={this.props.submit}
                  id="signUpButton"
                  onClick={this.props.handleCreateUser}
                  block>
                  Get started!
                </Button>
              </Col>
              <Col sm={1} />
            </Row>

            {this.props.inputData.validatePassword ? (
              <Row>
                <Col sm={1} />
                <Col sm={10} className="createUserError">
                  <Alert color="danger">
                    it doesn&apos;t match with your password
                  </Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}

            {this.props.inputData.error ? (
              <Row>
                <Col sm={1} />
                <Col sm={10} className="createUserError">
                  <Alert color="danger"> {this.props.inputData.error}</Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
            {this.props.createUserError.length > 0 ? (
              <Row>
                <Col sm={1} />
                <Col sm={10} className="createUserError">
                  <Alert color="danger">
                    {this.props.createUserError.map((error, i) => (
                      <p key={i}>&ndash;{error}</p>
                    ))}
                  </Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
          </Fragment>
        ) : (
          ""
        )}
      </Form>
    );
  }
}
