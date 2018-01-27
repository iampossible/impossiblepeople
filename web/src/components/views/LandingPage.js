import React, { Component, Fragment } from "react";
import FacebookLogin from "react-facebook-login";
import { Container, Row, Col, Button } from "reactstrap";
import { RingLoader } from "react-spinners";
import CreateUser from "./CreateUser";
import Login from "./Login";
export default class LandingPage extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      //to whether display login form or not
      login: false,
      //to whether display registration form or not
      register: false,
      firstName: "",
      lastName: "",
      organisationName: "",
      role: "",
      email: "",
      password: "",
      typeOfUser: "",
      validatePassword: false,
      logInEmail: "",
      logInPassword: "",
      //to display error message if the user can't be allowed to login
      error: null
    };
  }

  toggleDisplayForm = e => {
    if (e.target.name == "dispalyRegistrationForm") {
      this.setState({
        register: true,
        login: false
      });
    } else {
      this.setState({
        register: false,
        login: true
      });
    }
  };
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
      //just for see the result of the operation...needs to be removed
      .then(response => {
        if (response.status > 399) return { error: response.message };
        return response.json();
      })
      .then(response => {
        if (response) {
          this.redirectOnSubmit(newUser);
        }
      })
      .catch(err => console.error(err));
  };

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState(
      {
        [name]: value
      },
      () => {
        if (name == "confirmPassword" && value !== this.state.password) {
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

  handleSelect = e => {
    this.setState({
      typeOfUser: e.target.value,
      email: "",
      password: ""
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
      .then(response => {
        if (response.status > 399) {
          throw "Invalid credentials";
        }
        return response.json();
      })
      .then(response => {
        if (response) {
          this.redirectOnSubmit(response);
        }
      })
      .catch(err => {
        this.setState({ error: err });
      });
  };

  redirectOnSubmit = newUser => {
    let user = Object.assign({}, newUser);
    this.props.setUser(user);
    this.props.history.push("/feed");
  };
  render() {
    let { loading, login, register, ...inputData } = this.state;

    return (
      <Container id="btnFacebook">
        {!this.state.loading ? (
          <Fragment>
            <Row>
              <Col sm={4} />
              <Col sm={4} xs={12}>
                <FacebookLogin
                  appId="138462666798513"
                  autoLoad={false}
                  icon="fa-facebook fa-lg"
                  fields="name,email,picture,friends"
                  callback={this.responseFacebook}
                />
              </Col>
              <Col sm={4} />
            </Row>
            <Row id="register_login_buttonsContainer">
              <Col sm={4} />
              <Col sm={2}>
                <Button
                  color="success"
                  name="dispalyLoginForm"
                  onClick={this.toggleDisplayForm}>
                  &nbsp; Login
                </Button>
              </Col>
              <Col sm={2}>
                <Button
                  color="danger"
                  name="dispalyRegistrationForm"
                  onClick={this.toggleDisplayForm}>
                  Register
                </Button>
              </Col>
              <Col sm={4} />
            </Row>
            <Row>
              <Col sm={2} />
              <Col sm={8}>
                {this.state.register ? (
                  <CreateUser
                    handleChange={this.handleChange}
                    handleSelect={this.handleSelect}
                    handleCreateUser={this.handleCreateUser}
                    inputData={inputData}
                  />
                ) : null}
                {this.state.login ? (
                  <Login
                    logInEmail={this.state.logInEmail}
                    logInPassword={this.state.logInPassword}
                    error={this.state.error}
                    handleLogin={this.handleLogin}
                    handleChange={this.handleChange}
                  />
                ) : null}
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
                  size={100} /*the size of the spinner*/
                />
              </div>
            </Col>
            <Col sm={4} />
          </Row>
        )}
      </Container>
    );
  }
}
