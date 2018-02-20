import React, { Component, Fragment } from "react";
import { Row, Col, Alert } from "reactstrap";
import { handleErrors } from "../../utillity/helpers";
import { RingLoader } from "react-spinners";

export default class Profile extends Component {
  state = {
    user: null,
    profileLoadError: null
  };

  componentWillMount() {
    this.getUser(this.props.userID);
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
          user: response
        });
      })
      .catch(err => {
        this.setState(
          {
            profileLoadError: `Oopa!, something happend with getting the user profile. Please, try again later`
          },
          () => {
            //clear the error message
            setTimeout(() => {
              this.setState({
                profileLoadError: null
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
  isPageReady = () => {
    return this.state.user;
  };
  render() {
    return (
      <div id="popup">
        <div id="showProfile" className="popupInner">
          {!this.isPageReady() ? (
            <Row>
              <Col xs={4} />
              <Col xs={4} id="interestRingLoader">
                <div className="RingLoader center-loading">
                  <RingLoader
                    color="#123abc"
                    size={100} /*the size of the spinner*/
                  />
                </div>
              </Col>
              <Col xs={4} />
            </Row>
          ) : (
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
                {this.state.profileLoadError ? (
                  <Row>
                    <Col sm={1} />
                    <Col sm={10}>
                      <Alert color="danger">
                        {this.state.profileLoadError}
                      </Alert>
                    </Col>
                    <Col sm={1} />
                  </Row>
                ) : (
                  ""
                )}
              </Col>
            </Row>
          )}
        </div>
      </div>
    );
  }
}
