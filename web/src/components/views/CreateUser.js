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

export default class CreateUser extends Component {
  render() {
    return (
      <Form>
        <FormGroup row>
          <Col sm={3}>
            <span>I&apos;m registering as</span>
          </Col>
          <Col sm={3}>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="userType"
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
                  name="userType"
                  value="organisation"
                  onChange={this.props.handleSelect}
                />
                Organisation
              </Label>
            </FormGroup>
          </Col>
          <Col sm={3} />
        </FormGroup>
        {this.props.inputData.userType === "organisation" ? (
          <Fragment>
            <FormGroup row>
              <Label for="organisationName" sm={3}>
                Org. Name
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
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Label for="role" sm={3}>
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
              <Label for="firtsName" sm={3}>
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
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Label for="lastName" sm={3}>
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
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Label for="email" sm={3}>
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
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Label for="password" sm={3}>
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
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Label for="password" sm={3}>
                Confirm Password
              </Label>
              <Col sm={8}>
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
                <Col sm={3} />
                <Col sm={8}>
                  <Alert color="danger">
                    it doesn't match with your password
                  </Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
            {this.props.inputData.error ? (
              <Row>
                <Col sm={3} />
                <Col sm={8}>
                  <Alert color="danger"> {this.props.inputData.error}</Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
            <Row>
              <Col sm={3} />
              <Col sm={8}>
                <Button color="danger" onClick={this.props.handleCreateUser}>
                  Submit
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
