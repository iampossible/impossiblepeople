import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col, Button } from "reactstrap";

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
    const headerImage =
      "https://humankind-assets.s3.eu-west-1.amazonaws.com/post/GompTy5bPN3G9";
    return (
      <header>
        <Row>
          <Col sm={2} id="headerLogoImage" />
          <Col sm={user && user.admin ? 5 : 7} id="headerImage">
            <img src={headerImage} alt="header" />
          </Col>
          <Col sm={user && user.admin ? 5 : 3} id="headerNavigationButtons">
            <Row>
              {user &&
              user.admin &&
              (location.pathname === "/feed" ||
                location.pathname === "/profile") ? (
                <Col sm={5} id="headerButtonApproveOrgs">
                  <Button
                    onClick={() => {
                      this.props.history.push({
                        pathname: "/admin"
                      });
                    }}>
                    Manage Users &nbsp;&nbsp;<i
                      className="fa fa-gears"
                      aria-hidden="true"
                    />
                  </Button>
                </Col>
              ) : null}

              {location.pathname === "/admin" ||
              location.pathname === "/profile" ? (
                <Col
                  sm={
                    user && user.admin && location.pathname !== "/admin" ? 3 : 5
                  }
                  id="headerButtonFeed">
                  <Button
                    onClick={() => {
                      this.props.history.push({
                        pathname: "/feed"
                      });
                    }}>
                    Feed&nbsp;&nbsp;<i
                      className="fa fa-file-text-o"
                      aria-hidden="true"
                    />
                  </Button>
                </Col>
              ) : null}

              {location.pathname === "/feed" ||
              location.pathname === "/admin" ? (
                <Col sm={user && user.admin ? 3 : 5} id="headerButtonProfile">
                  <Button
                    style={user && user.admin ? { marginLeft: "0em" } : null}
                    onClick={() => {
                      this.props.history.push({
                        pathname: "/profile"
                      });
                    }}
                    block>
                    Profile&nbsp;&nbsp;
                    <i className="fa fa fa-user-circle" aria-hidden="true" />
                  </Button>
                </Col>
              ) : null}

              {location.pathname !== "/" ? (
                <Col sm={user && user.admin ? 3 : 5} id="headerButtonLogout">
                  <Button onClick={this.handlelogout}>
                    Logout &nbsp;&nbsp;<i
                      className="fa fa-sign-out"
                      aria-hidden="true"
                    />
                  </Button>
                </Col>
              ) : (
                <Fragment>
                  <Col sm={4} />
                  <Col sm={8} id="register_login_buttonsContainer">
                    <Button
                      id="signIn"
                      name="dispalyLoginForm"
                      onClick={this.props.toggleDisplayForm}>
                      &nbsp; Sign in &nbsp; &nbsp;{" "}
                      <i className="fa fa-lock" aria-hidden="true" />
                    </Button>
                  </Col>
                </Fragment>
              )}
            </Row>
          </Col>
        </Row>
      </header>
    );
  }
}

export default withRouter(Header);
