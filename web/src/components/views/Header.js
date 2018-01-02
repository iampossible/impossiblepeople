import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";
import logo from "../../assets/images/logo.png";

class Header extends Component {
  state = {
    user: {}
  };

  componentDidMount() {
    //to help us identify the userType @ line 44
    this.setState({ user: this.props.user });
  }

  handlelogout = () => {
    fetch(`/api/auth/logout`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      //must be set else for next request you will get 401:unauthorised
      credentials: "same-origin"
    }).then(
      response =>
        response.status === 200 ? this.props.history.push("/") : null
    );
  };
  render() {
    const { location } = this.props;

    return (
      <header>
        <Row>
          <Col xs={1} className="headerImage">
            {location.pathname !== "/" ? <img src={logo} alt="logo" /> : null}
          </Col>
          <Col
            xs={
              location.pathname === "/" ||
              location.pathname === "/updateInterest" ||
              location.pathname === "/interest" ||
              (location.state && location.state.user.userType !== "volunteer")
                ? 8
                : 10
            }
          >
            <h1> We Are One </h1>
          </Col>
          {location.pathname === "/feed" &&
          (location.state && location.state.user.userType === "volunteer") ? (
            <Col xs={2} className="headerButtonUpdateInterest">
              <Button
                onClick={() => {
                  this.props.history.push("/updateInterest");
                }}
              >
                Update Interest
              </Button>
            </Col>
          ) : null}
          <Col xs={1} className="headerButtonLogout">
            {location.pathname === "/interest" ||
            location.pathname === "/feed" ||
            location.pathname === "/updateInterest" ? (
              <Button onClick={this.handlelogout}>Logout</Button>
            ) : null}
          </Col>
        </Row>
      </header>
    );
  }
}

export default withRouter(Header);
