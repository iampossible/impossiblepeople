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
          <Col sm={1} id="headerImage">
            {location.pathname !== "/" ? <img src={logo} alt="logo" /> : null}
          </Col>
          <Col sm={10}>
            <h1> We Are One </h1>
          </Col>
          <Col sm={1} />
        </Row>
        <Row id="headerNavigationButtons">
          <Col sm={7} />
          {location.pathname === "/feed" && (user && user.admin) ? (
            <Col sm={2} id="headerButtonApproveOrgs">
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
          ) : (
            <Col sm={2} />
          )}

          {location.pathname === "/admin" ||
          location.pathname === "/buildProfile" ? (
            <Col sm={1} id="headerButtonHome">
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

          {location.pathname === "/feed" || location.pathname === "/admin" ? (
            <Col xs={1} id="headerButtonProfile">
              <Button
                onClick={() => {
                  this.props.history.push({
                    pathname: "/buildProfile"
                  });
                }}
                block>
                <i className="fa fa-angle-double-right" aria-hidden="true" />&nbsp;&nbsp;
                Profile
              </Button>
            </Col>
          ) : null}

          <Col xs={1} id="headerButtonLogout">
            {location.pathname !== "/" ? (
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
