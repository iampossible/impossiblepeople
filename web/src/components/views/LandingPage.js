import React, { Component, Fragment } from "react";
import { Row, Col, Button } from "reactstrap";
import { RingLoader } from "react-spinners";
import CreateUser from "./CreateUser";
import Login from "./Login";
import { handleErrors } from "../../utillity/helpers";

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
      userType: "",
      validatePassword: false,
      logInEmail: "",
      logInPassword: "",
      confirmPassword: "",
      facebookLoginError: null,
      submit: true,
      createUserError: "",
      loginError: "",
      forgotPasswordFlag: false,
      recoverPasswordEmail: "",
      forgotPasswordMessage: null,

      //to display error message if the user can't be allowed to login
      error: null
    };
  }

  handleCreateUser = () => {
    let error = [];
    if (this.state.userType === "organisation") {
      if (this.state.organisationName === "") {
        error.push("You need to put your Organisation name");
      }
      if (this.state.role === "") {
        error.push("You need to put your role");
      }
    }
    if (this.state.firstName === "") {
      error.push("You need to put your first name");
    }
    if (this.state.lastName === "") {
      error.push("You need to put your last name");
    }
    if (this.state.email === "") {
      error.push("You need to put your email address");
    } else {
      // regular expression to validate if the email address is in a valid format
      let emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //verify the email address and notify success or error
      if (!emailRegExp.test(this.state.email)) {
        error.push("The email address " + this.state.email + " is not valid");
      }
    }
    if (this.state.password === "") {
      error.push("You need to put your password");
    }
    if (this.state.confirmPassword === "") {
      error.push("You need to put your confirmation password");
    }

    if (error.length > 0) {
      this.setState(
        {
          createUserError: error
        },
        () => {
          //clear the error message
          setTimeout(() => {
            this.setState({
              createUserError: ""
            });
          }, 5000);
        }
      );
    } else {
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
          facebookLoginError,
          submit,
          createUserError,
          loginError,
          forgotPasswordFlag,
          recoverPasswordEmail,
          forgotPasswordMessage,
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
          facebookLoginError,
          submit,
          createUserError,
          loginError,
          forgotPasswordFlag,
          recoverPasswordEmail,
          forgotPasswordMessage,
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
              error: "Error : the user already exists"
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
    }
  };
  handleUserAgreement = e => {
    this.setState({
      submit: !this.state.submit
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
    const name = e.target.name.trim();
    if (name === "volunteer") {
      this.setState({
        userType: "volunteer"
      });
    } else if (name === "organisation") {
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
              .then(handleErrors)
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
              .catch(err => {
                this.setState(
                  {
                    facebookLoginError:
                      "There seems to be a problem logging you in through Facebook. Please, try again later",
                    loading: false
                  },
                  () => {
                    setTimeout(() => {
                      this.setState({
                        facebookLoginError: ""
                      });
                    }, 5000);
                  }
                );
              })
          );
        }
      );
    }
  };

  handleLogin = () => {
    let error = [];

    if (this.state.logInEmail === "") {
      error.push("You need to put your email address");
    } else {
      // regular expression to validate if the email address is in a valid format
      let emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //verify the email address and notify for error, if there is one
      if (!emailRegExp.test(this.state.logInEmail)) {
        error.push(
          "The email address " + this.state.logInEmail + " is not valid"
        );
      }
    }
    if (this.state.logInPassword === "") {
      error.push("You need to put your password");
    }

    if (error.length > 0) {
      this.setState(
        {
          loginError: error
        },
        () => {
          //clear the error message
          setTimeout(() => {
            this.setState({
              loginError: ""
            });
          }, 5000);
        }
      );
    } else {
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
            { error: "oops: Your email address or password is wrong " },
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
    }
  };
  handleForgotPassword = () => {
    let error = [];

    if (this.state.recoverPasswordEmail === "") {
      error.push("You need to put your email address");
    } else {
      // regular expression to validate if the email address is in a valid format
      let emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //verify the email address and notify for error, if there is one
      if (!emailRegExp.test(this.state.recoverPasswordEmail)) {
        error.push(
          "The email address " +
            this.state.recoverPasswordEmail +
            " is not valid"
        );
      }
    }
    if (error.length > 0) {
      this.setState(
        {
          error: error
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
    } else {
      fetch("/api/auth/recover", {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify({ email: this.state.recoverPasswordEmail })
      })
        .then(response => response.json())
        .then(response => {
          if (response.msg) {
            throw new Error(response.msg);
          }

          this.setState(
            {
              forgotPasswordMessage:
                "Please, check your email. We have sent you a new password",
              recoverPasswordEmail: ""
            },
            () => {
              //clear the error message
              setTimeout(() => {
                this.setState({
                  forgotPasswordMessage: ""
                });
                this.toggleForgotPassword();
              }, 5000);
            }
          );
        })
        .catch(err => {
          this.setState({ error: "Oops: " + err.message }, () => {
            //clear the error message
            setTimeout(() => {
              this.setState({
                error: ""
              });
            }, 5000);
          });
        });
    }
  };
  toggleForgotPassword = () => {
    this.setState({
      forgotPasswordFlag: !this.state.forgotPasswordFlag
    });
  };
  redirectOnSubmit = user => {
    this.props.setUser(user);
    this.props.history.push("/feed");
  };
  render() {
    let { loading, ...inputData } = this.state;
    const landinPageInfoImage =
      "https://humankind-assets.s3.eu-west-1.amazonaws.com/post/GompTy5bPN3G9";
    return (
      <Fragment>
        {!this.state.loading ? (
          <Fragment>
            <Row>
              <Col sm={2} />
              <Col sm={8} id="landingPageContentSection">
                <Row>
                  <Col sm={2} />
                  <Col sm={8} id="landingPageWelcome">
                    <h1>
                      Welcome to
                      <img src={landinPageInfoImage} alt="headerImage" />
                    </h1>
                    {!this.props.login || this.props.register ? (
                      <h6>Please tell us about yourself.</h6>
                    ) : (
                      ""
                    )}
                  </Col>
                  <Col sm={2} />
                </Row>
                {!this.props.login || this.props.register ? (
                  <Row id="landingPageUserType">
                    <Col sm={2} />
                    <Col sm={4}>
                      <Button
                        id="landingPageVolunteeButton"
                        onClick={e => this.handleUserTypeSelection(e)}
                        name="volunteer"
                        className={
                          this.state.userType === "volunteer" &&
                          this.props.register
                            ? "selectedUserTypeButton"
                            : ""
                        }>
                        I'm an Individual
                      </Button>
                    </Col>
                    <Col sm={4}>
                      <Button
                        id="landingPageOrganisationButton"
                        onClick={e => this.handleUserTypeSelection(e)}
                        name="organisation"
                        className={
                          this.state.userType === "organisation" &&
                          this.props.register
                            ? "selectedUserTypeButton"
                            : ""
                        }>
                        I'm a group
                      </Button>
                    </Col>
                    <Col sm={2} />
                  </Row>
                ) : (
                  ""
                )}

                {!this.props.register && !this.props.login ? (

                  <Row>
                   <Row id="betaVersionInfo">
                   <Col sm={12}>
                    <p>
                      <strong>TESTING TESTING</strong> ……
                    </p>
                    <p>
                      Welcome to the Beta test version for Humankind.<br/>
                      This is a work in progress.<br/>
                      There will be lots of issues and we need you
                      to help us to identify them.<br/>
                      Please give us your feedback
                      using the link below ( in the footer)
                    </p>
                  </Col>
                  </Row>
                  <Row id="landingPageInfo">
                    <Row>
                      <Col sm={1}>
                        <i className="fa fa-check" aria-hidden="true" />
                      </Col>
                      <Col sm={11}>
                        <p>
                          Connect with a community of volunteers and purposeful
                          organisations.
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={12}>
                        <hr />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={1}>
                        <i className="fa fa-check" aria-hidden="true" />
                      </Col>
                      <Col sm={11}>
                        <p>
                          Coordinate and be more efficient at helping others.
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={12}>
                        <hr />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={1}>
                        <i className="fa fa-check" aria-hidden="true" />
                      </Col>
                      <Col sm={11}>
                        <p>Measure your impact.</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={12}>
                        <hr />
                      </Col>
                    </Row>
                  </Row>
                  </Row>
                ) : (
                  <Fragment>
                    <Row id="signUpsignInhr">
                      <Col sm={1} />
                      <Col sm={10}>
                        <hr />
                      </Col>
                      <Col sm={1} />
                    </Row>
                    <Row id="landingPageSignUpSignInContainer">
                      <Col sm={1} />
                      <Col sm={10}>
                        {this.props.register ? (
                          <CreateUser
                            handleChange={this.handleChange}
                            handleSelect={this.handleSelect}
                            handleCreateUser={this.handleCreateUser}
                            inputData={inputData}
                            responseFacebook={this.responseFacebook}
                            facebookLoginError={this.state.facebookLoginError}
                            handleUserAgreement={this.handleUserAgreement}
                            submit={this.state.submit}
                            createUserError={this.state.createUserError}
                          />
                        ) : (
                          <Login
                            logInEmail={this.state.logInEmail}
                            logInPassword={this.state.logInPassword}
                            error={this.state.error}
                            handleLogin={this.handleLogin}
                            handleChange={this.handleChange}
                            responseFacebook={this.responseFacebook}
                            facebookLoginError={this.state.facebookLoginError}
                            loginError={this.state.loginError}
                            handleForgotPassword={this.handleForgotPassword}
                            toggleForgotPassword={this.toggleForgotPassword}
                            forgotPasswordFlag={this.state.forgotPasswordFlag}
                            forgotPasswordMessage={
                              this.state.forgotPasswordMessage
                            }
                            recoverPasswordEmail={
                              this.state.recoverPasswordEmail
                            }
                          />
                        )}
                      </Col>
                      <Col sm={1} />
                    </Row>
                  </Fragment>
                )}
              </Col>

              <Col sm={2} />
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
                  size={70} /*the size of the spinner*/
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
