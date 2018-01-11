import React, { Component } from "react";
import { Button, ListGroup, ListGroupItem, Row, Col } from "reactstrap";
import { UserType } from "../UserType";
import { RingLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.css";

export default class Interest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //to hold all the featured interests from the DB
      featuredInterest: [],
      //to hold the interests that the user picks
      interests: new Set(),
      loading: true
    };
  }

  //to handle the selection when the button is clicked
  handleSelection(evt) {
    //get the interestID from the button selected/clicked
    let interestID = evt.target.value;
    let interests = new Set(this.state.interests);
    if (interests.has(interestID)) {
      interests.delete(interestID);
      this.setState({ interests });
    } else {
      interests.add(interestID);
      this.setState({ interests });
    }
  }

  componentDidMount() {
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
    this.setSelectedInterests(this.props.user);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.user) !== JSON.stringify(nextProps.user)) {
      this.setSelectedInterests(nextProps.user);
    }
  }

  setSelectedInterests = user => {
    let currentInterests = user.hasOwnProperty("interests")
      ? user.interests.map(interest => interest.interestID)
      : [];
    this.setState({ interests: new Set(currentInterests) });
  };

  redirectOnSubmit = userType => {
    this.props.getUser();
    let user = Object.assign({}, this.props.user, {
      userType: userType
    });
    this.props.setUser(user);
    this.props.history.push("/feed");
  };

  render() {
    const { featuredInterest } = this.state;
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
          <Col sm={10} xs={12}>
            <ListGroup
              id="lists"
              className="d-flex flex-row flex-wrap align-content-center"
            >
              {featuredInterest.map((interest, index) => {
                return (
                  <ListGroupItem key={interest.interestID}>
                    <Button
                      className={
                        this.state.interests.has(interest.interestID)
                          ? "interestButton selectedButton"
                          : "interestButton"
                      }
                      onClick={e => {
                        this.handleSelection(e);
                      }}
                      value={interest.interestID}
                      disabled={this.state.buttonDisabled}
                    >
                      {interest.name}
                    </Button>
                  </ListGroupItem>
                );
              })}
            </ListGroup>
            <hr />
          </Col>
          <Col sm={1} />
        </Row>
        <UserType
          interests={this.state.interests}
          redirectOnSubmit={this.redirectOnSubmit}
        />
      </div>
    );
  }
}
