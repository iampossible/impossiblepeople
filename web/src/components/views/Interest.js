import React, { Component, Fragment } from "react";
import { Button, ListGroup, ListGroupItem, Row, Col } from "reactstrap";
import { RingLoader } from "react-spinners";
import { CSSTransitionGroup } from "react-transition-group";

export default class Interest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //to hold all the featured interests from the DB
      featuredInterest: [],
      loading: true
    };
  }

  componentWillMount() {
    //load all the featured interests from the DB
    fetch(`/api/interest`, {
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 401) this.props.history.push("/");
        if (response.status > 399) return [];
        return response.json();
      })
      .then(response => {
        this.setState({
          featuredInterest: response,
          loading: false
        });
      });
  }

  displayInterestButton = interest => {
    const TRANSITION_APPEAR_TIMEOUT = 3000;
    return (
      <ListGroupItem key={interest.interestID}>
        <Button
          className={
            this.props.interests.has(interest.interestID)
              ? "interestButton  btn-block btn-md selectedButton"
              : "interestButton  btn-block btn-md"
          }
          onClick={e => {
            this.props.handleInterestSelection(e);
          }}
          value={interest.interestID}>
          {interest.name}
        </Button>
        {interest.tags ? (
          <p
            className="interestDetail-info"
            onClick={() =>
              this.props.toggleShowInterestsMoreInfo(interest.interestID)
            }>
            <i className="fa fa-info-circle" aria-hidden="true" />
          </p>
        ) : null}
        {this.props.showInterestsMoreInfo === interest.interestID &&
        interest.tags ? (
          <CSSTransitionGroup
            transitionName="fadeCommentContainer"
            transitionAppear={true}
            transitionAppearTimeout={TRANSITION_APPEAR_TIMEOUT}
            transitionEnter={false}
            transitionLeave={false}>
            <p className="relatedTagsHeading">It includes</p>
            <ul className="relatedTags">
              {interest.tags.map(tag => (
                <li key={`interest.id ${tag}`}>&ndash;&nbsp;{tag}</li>
              ))}
            </ul>
          </CSSTransitionGroup>
        ) : null}
      </ListGroupItem>
    );
  };
  render() {
    const { featuredInterest } = this.state;

    const OTHER_INTERESTID = "cddf8db1";
    const otherInterest = { interestID: OTHER_INTERESTID, name: "Other" };
    let i = 0;

    return this.state.loading ? (
      <Row>
        <Col xs={4} />
        <Col xs={4} id="interestRingLoader">
          <div className="RingLoader center-loading">
            <RingLoader
              color="#123abc"
              loading={this.state.loading}
              size={100} /*the size of the spinner*/
            />
          </div>
        </Col>
        <Col xs={4} />
      </Row>
    ) : (
      <div id="interest">
        <Row>
          <Col sm={1} />
          <Col sm={10} id="listOfInterests">
            <ListGroup className="d-flex flex-row flex-wrap align-content-center">
              {featuredInterest.map((interest, index) => {
                i++;
                if (interest.interestID !== OTHER_INTERESTID) {
                  return (
                    <Fragment>
                      {this.displayInterestButton(interest)}
                      {i === featuredInterest.length
                        ? this.displayInterestButton(otherInterest)
                        : null}
                    </Fragment>
                  );
                }
              })}
            </ListGroup>
          </Col>
          <Col sm={1} />
        </Row>
      </div>
    );
  }
}
