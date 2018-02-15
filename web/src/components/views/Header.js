import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { Row, Col } from "reactstrap";

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
      <Row>
        {location.pathname === "/" ||
        location.pathname === "/userAgreement" ||
        location.pathname === "/privacyPolicy" ||
        location.pathname === "/faq" ||
        location.pathname === "/feedback" ? (
          <Col sm={4} />
        ) : null}

        {location.pathname !== "/userAgreement" &&
        location.pathname !== "/privacyPolicy" &&
        location.pathname !== "/faq" &&
        location.pathname !== "/feedback" ? (
          <Fragment>
            {location.pathname !== "/" ? (
              <Col sm={2} id="headerProfileLink">
                <span
                  className={
                    location.pathname === "/profile" ? "activePage" : ""
                  }
                  onClick={() => {
                    this.props.history.push({
                      pathname: "/profile"
                    });
                  }}>
                  <img src={user.imageSource} id="myProfileLinkImage" />
                  <span className="headerLinkTextContent">
                    &nbsp;&nbsp;&nbsp;&nbsp;My Profile
                  </span>
                </span>
              </Col>
            ) : null}
            {location.pathname !== "/" ? (
              <Col sm={2} id="headerFeedLink">
                <span
                  className={location.pathname === "/feed" ? "activePage" : ""}
                  onClick={() => {
                    this.props.history.push({
                      pathname: "/feed"
                    });
                  }}>
                  <i className="fa fa-file-text" aria-hidden="true" />
                  <span className="headerLinkTextContent">
                    {" "}
                    &nbsp;&nbsp;&nbsp;&nbsp;My Feed
                  </span>
                </span>
              </Col>
            ) : null}
          </Fragment>
        ) : null}
        <Col sm={4} id="headerImage">
          <img src={headerImage} alt="header" />
        </Col>
        {user && !user.admin && location.pathname !== "/" ? (
          <Col sm={3} />
        ) : null}
        {user &&
        user.admin &&
        location.pathname !== "/" &&
        location.pathname !== "/userAgreement" &&
        location.pathname !== "/privacyPolicy" &&
        location.pathname !== "/faq" &&
        location.pathname !== "/feedback" ? (
          <Col sm={3} id="headerApproveOrgsLink">
            <span
              className={location.pathname === "/admin" ? "activePage" : ""}
              onClick={() => {
                this.props.history.push({
                  pathname: "/admin"
                });
              }}>
              <span className="headerLinkTextContent">
                {" "}
                Manage User&nbsp;&nbsp;
              </span>
              <i className="fa fa-gears" aria-hidden="true" />
            </span>
          </Col>
        ) : null}
        {location.pathname !== "/" &&
        location.pathname !== "/userAgreement" &&
        location.pathname !== "/privacyPolicy" &&
        location.pathname !== "/faq" &&
        location.pathname !== "/feedback" ? (
          <Col sm={1} id="headerLogoutLink">
            <span onClick={this.handlelogout}>
              <span className="headerLinkTextContent">Logout&nbsp;&nbsp;</span>
              <i className="fa fa-sign-out" aria-hidden="true" />
            </span>
          </Col>
        ) : null}
        {location.pathname !== "/userAgreement" &&
        location.pathname !== "/privacyPolicy" &&
        location.pathname !== "/faq" &&
        location.pathname !== "/feedback" &&
        location.pathname === "/" ? (
          <Fragment>
            <Col sm={2} />
            <Col sm={2} id="headerSignInLink">
              <span
                name="dispalyLoginForm"
                onClick={this.props.toggleDisplayForm}>
                Sign in &nbsp;&nbsp;
                <i className="fa fa-lock" aria-hidden="true" />
              </span>
            </Col>
          </Fragment>
        ) : null}
      </Row>
    );
  }
}

export default withRouter(Header);
