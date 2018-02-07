import React, { Component, Fragment } from "react";
import { Row, Col, Button } from "reactstrap";
import { RingLoader } from "react-spinners";
import CreateUser from "./CreateUser";
import Login from "./Login";
import headerImage from "../../assets/images/Handwritten White.png";

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}

export default class LandingPage extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      firstName: "",
      lastName: "",
      organisationName: "",
      role: "",
      email: "",
      password: "",
      userType: "organisation",
      validatePassword: false,
      logInEmail: "",
      logInPassword: "",
      confirmPassword: "",
      //to display error message if the user can't be allowed to login
      error: null
    };
  }

  handleCreateUser = () => {
    let newUser = {};
    if (this.state.organisationName !== "") {
      let {
        validatePassword,
        confirmPassword,
        loading,
        login,
        register,
        logInEmail,
        logInPassword,
        error,
        ...user
      } = this.state;
      Object.assign(newUser, user);
    } else {
      let {
        validatePassword,
        organisationName,
        role,
        confirmPassword,
        loading,
        login,
        register,
        logInEmail,
        logInPassword,
        error,
        ...user
      } = this.state;
      Object.assign(newUser, user);
    }

    fetch("/api/user/create", {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUser)
    })
      .then(handleErrors)
      .then(response => response.json())
      .then(response => {
        this.redirectOnSubmit(response);
      })
      .catch(err => {
        this.setState(
          {
            firstName: "",
            lastName: "",
            organisationName: "",
            role: "",
            email: "",
            password: "",
            confirmPassword: "",
            error: err.message + " : the user already exists"
          },
          () => {
            //clear the error message
            setTimeout(() => {
              this.setState({
                error: ""
              });
            }, 5000);
          }
        );
      });
  };

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState(
      {
        [name]: value
      },
      () => {
        if (name === "confirmPassword" && value !== this.state.password) {
          this.setState({
            validatePassword: true
          });
        } else {
          this.setState({
            validatePassword: false
          });
        }
      }
    );
  };

  handleUserTypeSelection = e => {
    const value = e.target.textContent.trim();
    if (value === "Volunteer") {
      this.setState({
        userType: "volunteer"
      });
    } else if (value === "Organisation") {
      this.setState({
        userType: "organisation"
      });
    }
    this.props.toggleDisplayForm(e);
  };

  handleSelect = e => {
    this.setState({
      userType: e.target.value,
      email: "",
      password: "",
      error: null
    });
  };
  responseFacebook = response => {
    if (response.status !== "unknown") {
      this.setState(
        {
          loading: true
        },
        () => {
          //validate the token
          return (
            fetch(`/api/facebook/check?token=${response.accessToken}`, {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              //must be set else for next request you will get 401:unauthorised
              credentials: "same-origin"
            })
              //if it is valid create the user and return some of his/her data
              .then(response => response.json())
              .then(response => {
                let user = response;
                this.props.setUser(user);
                if (
                  user &&
                  user.hasOwnProperty("userType") &&
                  user.userType === ""
                ) {
                  this.props.history.push("/interest");
                }
                if (user && user.userType && user.userType !== "") {
                  this.props.history.push("/feed");
                }
              })
              .catch(err => console.log(err))
          );
        }
      );
    }
  };

  handleLogin = () => {
    const credentials = {
      email: this.state.logInEmail,
      password: this.state.logInPassword
    };

    fetch("/api/auth/login", {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(credentials)
    })
      .then(handleErrors)
      .then(response => response.json())
      .then(response => {
        if (response) {
          this.redirectOnSubmit(response);
        }
      })
      .catch(err => {
        this.setState(
          { error: err.message + ": The credentials are invalid " },
          () => {
            //clear the error message
            setTimeout(() => {
              this.setState({
                error: ""
              });
            }, 5000);
          }
        );
      });
  };

  redirectOnSubmit = user => {
    this.props.setUser(user);
    this.props.history.push("/feed");
  };
  render() {
    let { loading, ...inputData } = this.state;

    return (
      <Fragment>
        {!this.state.loading ? (
          <Fragment>
            <Row id="landingPageMain">
              <Col sm={6} id="landingPageInfo">
                <Row>
                  <Col sm={4} />
                  <Col sm={3}>
                    <p className="lead">With</p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1} />
                  <Col sm={9}>
                    <img src={headerImage} alt="headerImage" />
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <i className="fa fa-check" aria-hidden="true" />
                  </Col>
                  <Col sm={11}>
                    <p className="lead">
                      Connect with a community of volunteers and purposeful
                      orgs.
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <i className="fa fa-check" aria-hidden="true" />
                  </Col>
                  <Col sm={11}>
                    <p className="lead">
                      Coordinate and be more efficient at helping others.
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col sm={1}>
                    <i className="fa fa-check" aria-hidden="true" />
                  </Col>
                  <Col sm={11}>
                    <p className="lead">Measure your impact.</p>
                  </Col>
                </Row>
              </Col>
              <Col sm={6} id="landingPageSignUpSignInContainer">
                <Row id="landingPageUserType">
                  <Col sm={1} />
                  <Col sm={10}>
                    <p>
                      <u>I&apos;M a</u>
                    </p>
                    <Button
                      id="landingPageVolunteeButton"
                      onClick={e => this.handleUserTypeSelection(e)}>
                      Volunteer
                    </Button>
                    <Button
                      id="landingPageOrganisationButton"
                      onClick={e => this.handleUserTypeSelection(e)}>
                      Organisation
                    </Button>
                    <hr />
                  </Col>
                  <Col sm={1} />
                </Row>
                <Row>
                  <Col sm={1} />
                  <Col sm={10}>
                    {this.props.login ? (
                      <Login
                        logInEmail={this.state.logInEmail}
                        logInPassword={this.state.logInPassword}
                        error={this.state.error}
                        handleLogin={this.handleLogin}
                        handleChange={this.handleChange}
                        responseFacebook={this.responseFacebook}
                      />
                    ) : (
                      <CreateUser
                        handleChange={this.handleChange}
                        handleSelect={this.handleSelect}
                        handleCreateUser={this.handleCreateUser}
                        inputData={inputData}
                        responseFacebook={this.responseFacebook}
                      />
                    )}
                  </Col>
                  <Col sm={1} />
                </Row>
              </Col>
            </Row>
          </Fragment>
        ) : (
          <Row>
            <Col sm={4} />
            <Col sm={4} xs={12}>
              <div className="RingLoader center-loading">
                <RingLoader
                  color="#123abc"
                  loading={this.state.loading}
                  size={100} /*the size of the spinner*/
                />
              </div>
            </Col>
            <Col sm={4} />
          </Row>
        )}
      </Fragment>
    );
  }
}
