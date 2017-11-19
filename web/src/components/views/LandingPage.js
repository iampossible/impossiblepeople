import React, { Component } from "react";
import FacebookLogin from "react-facebook-login";
import { Container, Row, Col } from "reactstrap";

export default class LandingPage extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      token: ""
    };
  }
  responseFacebook = response => {
    this.setState({
      token: response.accessToken
    });
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
            user: response
          });
          if (user && user.hasOwnProperty("userType") && user.userType === "") {
            this.props.history.push("/interest", { user });
          }
          if (user && user.userType && user.userType !== "") {
            this.props.history.push("/feed",  { user } );
          }
          return response;
        })
        .catch(err => console.log(err))
    );
  };
  render() {
<<<<<<< HEAD
    const { user } = this.state;
    console.log(user)

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
=======
>>>>>>> 659fe3b3c772ca6cbcf6b10b54f64ca2956b62b5
    return (
      <Container id="btnFacebook">
        <Row>
          <Col className="sm-4" />
          <Col className="sm-4">
            <FacebookLogin
              appId="133088487346292"
              autoLoad={false}
              icon="fa-facebook fa-lg"
              fields="name,email,picture,friends"
              callback={this.responseFacebook}
            />
          </Col>
          <Col className="sm-4" />
        </Row>
      </Container>
    );
  }
}
