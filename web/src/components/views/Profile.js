import React, { Component, Fragment } from "react";
import { Row, Col } from "reactstrap";
import { handleErrors } from "../../utillity/helpers";

export default class Profile extends Component {
  state = {
    user: {},
    loading: false
  };

  componentWillMount() {
    this.setState(
      {
        loading: true
      },
      () => {
        this.getUser(this.props.userID);
      }
    );
  }
  getUser = userID => {
    const TIME_OUT_SECOND = 6000;
    fetch(`/api/profile/${userID}`, {
      credentials: "same-origin",
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
      .then(handleErrors)
      .then(response => response.json())
      .then(response => {
        this.setState({
          user: response,
          loading: false
        });
      })
      .catch(err => {
        this.setState(
          {
            loading: false,
            profileLoadError: `Oopa!, something happend with getting the user profile. Please, try again later`
          },
          () => {
            //clear the error message
            setTimeout(() => {
              this.setState({
                imageLoadError: null
              });
            }, TIME_OUT_SECOND);
          }
        );
      });
  };
  handleClosePopup = () => {
    this.props.handleShowProfile();
    window.scrollTo(0, 0);
  };
  render() {
    return (
      <div id="popup">
        <div id="showProfile" className="popupInner">
          <Row>
            <Col>
              <Row>
                <Col sm={11} />
                <Col sm={1}>
                  <span id="closePostPopup" onClick={this.handleClosePopup}>
                    &nbsp;<i
                      className="fa fa-times-circle-o"
                      aria-hidden="true"
                    />
                  </span>
                </Col>
              </Row>
              <Row id="profileImage">
                <Col>
                  <p>
                    <img
                      src={this.state.user.imageSource}
                      alt="ProfilePicture"
                    />
                  </p>
                </Col>
              </Row>
              <Row id="profileName">
                <Col>
                  <h5>
                    <strong>
                      <u>
                        {this.state.user.organisationName
                          ? this.state.user.organisationName
                          : this.state.user.firstName +
                            " " +
                            this.state.user.lastName}
                      </u>
                    </strong>
                  </h5>
                </Col>
              </Row>
              {this.state.user.description ? (
                <Row id="profileDescription">
                  <Col sm={3}>
                    <p>
                      <u>
                        {this.state.user.userType === "volunteer"
                          ? "About Me :"
                          : "About Us :"}
                      </u>
                    </p>
                  </Col>
                  <Col sm={9}>
                    <p>{this.state.user.description}</p>
                  </Col>
                </Row>
              ) : (
                ""
              )}

              {this.state.user.interests &&
              this.state.user.interests.length > 0 ? (
                <Row id="profileUrl">
                  <Col sm={3}>
                    <p>
                      <u>
                        {this.state.user.userType === "volunteer"
                          ? "Interested In:"
                          : "Our Remit:"}
                      </u>
                    </p>
                  </Col>

                  <Col sm={9}>
                    <p>
                      <em>
                        {this.state.user.interests.map((interest, index) => {
                          if (index == this.state.user.interests.length - 1) {
                            return interest.name;
                          } else {
                            return interest.name + " / ";
                          }
                        })}
                      </em>
                    </p>
                  </Col>
                </Row>
              ) : (
                ""
              )}
              {this.state.user.url ? (
                <Row id="profileUrl">
                  <Col sm={3}>
                    <p>
                      <u>For more Info:</u>
                    </p>
                  </Col>

                  <Col sm={9}>
                    <a href={this.state.user.url} target="_blank">
                      {this.state.user.url}
                    </a>
                  </Col>
                </Row>
              ) : (
                ""
              )}
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
