import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";

class Header extends Component {
  state = {
    user: {}
  };
  componentDidMount() {
    //to help us identify the userType @ line 44
    this.props.location.state
      ? this.setState({
          user: this.props.location.state.user
        })
      : {};
  }
  handlelogout = () => {
    fetch(`/api/auth/logout`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      //must be set else for next request you will get 401:unauthorised
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(response => {
        response.status === "logged Out" ? this.props.history.push("/") : null;
      });
  };
  render() {
    const { location } = this.props;
    console.log(this.state.user);
    return (
      <header className="App-header">
        <Row>
          <Col xs={2} />
          <Col xs={7}>
            <h1>We Are One</h1>
          </Col>
          <Col xs={2}>
            {location.pathname === "/feed" &&
            (location.state && location.state.user.userType === "volunteer") ? (
              <Button
                onClick={() => {
                  this.props.history.push("/interest", location.state.user);
                }}
              >
                Change Interest
              </Button>
            ) : null}
          </Col>
          <Col xs={1}>
            {location.pathname === "/interest" ||
            location.pathname === "/feed" ? (
              <Button onClick={this.handlelogout}>Logout</Button>
            ) : null}
          </Col>
        </Row>
      </header>
    );
  }
}

export default withRouter(Header);
