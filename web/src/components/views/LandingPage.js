import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import { Container, Row, Col } from "reactstrap";
import { RingLoader } from "react-spinners";
import { Redirect } from "react-router-dom";
export default class LandingPage extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      token: "",
      loading: false
    };
  }
  responseFacebook = response => {
    this.setState(
      {
        token: response.accessToken,
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
              this.setState({
                user: response,
                loading: false
              });
              if (
                user &&
                user.hasOwnProperty("userType") &&
                user.userType === ""
              ) {
                this.props.history.push("/interest", { user });
              }
              if (user && user.userType && user.userType !== "") {
                this.props.history.push("/feed", { user });
              }
              return response;
            })
            .catch(err => console.log(err))
        );
      }
    );
  };
  render() {
    const { user } = this.state;
    console.log(user);

    //once the user is authenticated redirect him/her to the interest page
    if (user && user.userType && user.userType === "organisation") {
      return (
        <Redirect
          to={{
            pathname: "/feed",
            state: {
              user: this.state.user,
              input: "",
              feed: [],
              submit: false,
              loadCommenets: []
            }
          }}
        />
      );
    }
    return (
      <Container id="btnFacebook">
        <Row>
          <Col className="sm-3" />
          <Col className="sm-6">
            {!this.state.loading ? (
              <FacebookLogin
                appId="133088487346292"
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
