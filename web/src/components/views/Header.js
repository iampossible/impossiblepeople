import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";

class Header extends Component {
  state = {
    user: {}
  };

  componentDidMount() {
    //to help us identify the userType @ line 44
    this.setState({user: this.props.user});
  }

  componentWillReceiveProps(newProps) {
    console.log(newProps);
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
    console.log(this.props);
    const { location } = this.props;
    console.log(location);
    return (
      <header className="App-header">
        <Row>
          <Col xs={2} className="headerImage" />
          <Col xs={7}>
            <h1>We Are One</h1>
          </Col>
          <Col xs={2} className="headerButton">
            {(location.pathname === "/feed") ? (
              <Button
                color="warning"
                onClick={() => {
                  this.props.history.push(
                    "/updateInterest"
                  );
                }}
              >
                Update Interest
              </Button>
            ) : null}
          </Col>
          <Col xs={1} className="headerButton">
            {location.pathname === "/interest" ||
            location.pathname === "/feed" ||
            location.pathname === "/updateInterest" ? (
              <Button color="warning" onClick={this.handlelogout}>
                Logout
              </Button>
            ) : null}
          </Col>
        </Row>
      </header>
    );
  }
}

export default withRouter(Header);
