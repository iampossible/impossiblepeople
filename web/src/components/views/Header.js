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
    const { user } = this.props;

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
              (user &&
                user.userType !== "volunteer" &&
                user.userType !== "admin")
                ? 10
                : 8
            }>
            <h1> We Are One </h1>
          </Col>
          {location.pathname === "/feed" &&
          (user && user.userType === "volunteer") ? (
            <Col xs={2} className="headerButtonUpdateInterest">
              <Button
                onClick={() => {
                  this.props.history.push({
                    pathname: "/updateInterest"
                  });
                }}>
                Update Interest
              </Button>
            </Col>
          ) : null}
          {location.pathname === "/feed" &&
          (user && user.userType === "admin") ? (
            <Col xs={2} className="headerButtonApproveOrgs">
              <Button
                onClick={() => {
                  this.props.history.push({
                    pathname: "/admin"
                  });
                }}>
                <i className="fa fa-gears" aria-hidden="true" />&nbsp;&nbsp;Manage
                Users
              </Button>
            </Col>
          ) : null}
          {location.pathname === "/admin" &&
          (user && user.userType === "admin") ? (
            <Col xs={2} className="headerButtonApproveOrgs">
              <Button
                onClick={() => {
                  this.props.history.push({
                    pathname: "/feed"
                  });
                }}>
                <i className="fa fa-home" aria-hidden="true" />&nbsp;&nbsp;Home
              </Button>
            </Col>
          ) : null}
          <Col xs={1} className="headerButtonLogout">
            {location.pathname === "/interest" ||
            location.pathname === "/feed" ||
            location.pathname === "/admin" ||
            location.pathname === "/updateInterest" ? (
              <Button onClick={this.handlelogout}>
                <i className="fa fa-angle-double-right" aria-hidden="true" />&nbsp;&nbsp;
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
