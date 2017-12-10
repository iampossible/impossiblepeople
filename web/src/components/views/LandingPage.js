import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import { Container, Row, Col } from "reactstrap";
import { RingLoader } from "react-spinners";

export default class LandingPage extends Component {
  constructor() {
    super();
    this.state = {
      loading: false
    };
  }
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
        <Row>
          <Col className="sm-3" />
          <Col className="sm-6">
            {!this.state.loading ? (
              <FacebookLogin
                appId="138462666798513"
                autoLoad={false}
                icon="fa-facebook fa-lg"
                fields="name,email,picture,friends"
                callback={this.responseFacebook}
              />
            ) : (
              <div className="RingLoader center-loading">
                <RingLoader
                  color="#123abc"
                  loading={this.state.loading}
                  size={100} /*the size of the spinner*/
                />
              </div>
            )}
          </Col>
          <Col className="sm-3" />
        </Row>
      </Container>
    );
  }
}
