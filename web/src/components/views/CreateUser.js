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
      <Form>
        {this.props.inputData.userType === "volunteer" ? (
          <Fragment>
            <Row>
              <Col sm={4} />
              <Col sm={7} xs={12} id="signUpFacebook">
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
              <Col sm={4} />
              <Col sm={8} style={{ textAlign: "center" }}>
                <p>&mdash;&mdash;&mdash;&nbsp;OR&nbsp;&mdash;&mdash;&mdash;</p>
              </Col>
            </Row>
          </Fragment>
        ) : (
          ""
        )}
        {this.props.inputData.userType === "organisation" ? (
          <Fragment>
            <FormGroup row>
              <Col sm={1} />
              <Label for="organisationName" sm={3} id="organisationNameLabel">
                Organisation Name
              </Label>
              <Col sm={7}>
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
              <Label for="role" sm={3}>
                Role
              </Label>
              <Col sm={7}>
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
              <Label for="firtsName" sm={3}>
                First Name
              </Label>
              <Col sm={7}>
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
              <Label for="lastName" sm={3}>
                Last Name
              </Label>
              <Col sm={7}>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last name"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.lastName}
                />
                <Col sm={1} />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Label for="email" sm={3}>
                Email
              </Label>
              <Col sm={7}>
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
              <Label for="password" sm={3}>
                Password
              </Label>
              <Col sm={7}>
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
              <Label for="password" sm={3} id="registerConfirmPassword">
                Confirm Password
              </Label>
              <Col sm={7}>
                <Input
                  type="password"
                  name="confirmPassword"
                  id="userRegistrationConfirmPassword"
                  placeholder="password"
                  onChange={this.props.handleChange}
                  value={this.props.inputData.confirmPassword}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            {this.props.inputData.validatePassword ? (
              <Row>
                <Col sm={4} />
                <Col sm={7}>
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
                <Col sm={4} />
                <Col sm={7}>
                  <Alert color="danger"> {this.props.inputData.error}</Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
            <Row>
              <Col sm={4} />
              <Col sm={7}>
                <Button
                  id="signUpButton"
                  onClick={this.props.handleCreateUser}
                  block>
                  Sign up with email
                </Button>
              </Col>
              <Col sm={1} />
            </Row>
          </Fragment>
        ) : (
          ""
        )}
      </Form>
    );
  }
}
