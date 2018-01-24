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
      login: false,
      register: false
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

  render() {
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
                  onClick={this.toggleDisplayForm}
                >
                  &nbsp; Login
                </Button>
              </Col>
              <Col sm={2}>
                <Button
                  color="danger"
                  name="dispalyRegistrationForm"
                  onClick={this.toggleDisplayForm}
                >
                  Register
                </Button>
              </Col>
              <Col sm={4} />
            </Row>
            <Row>
              <Col sm={2} />
              <Col sm={8}>
                {this.state.register ? <CreateUser /> : null}
                {this.state.login ? <Login /> : null}
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
