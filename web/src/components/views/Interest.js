import React, { Component } from "react";
import { Button, ListGroup, ListGroupItem, Row, Col } from "reactstrap";
import { RingLoader } from "react-spinners";

export default class Interest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //to hold all the featured interests from the DB
      featuredInterest: [],
      loading: true
    };
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
  }

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
          <Col xs={12}>
            <p> Interest </p>
            <ListGroup
              id="lists"
              className="d-flex flex-row flex-wrap align-content-center">
              {featuredInterest.map((interest, index) => {
                return (
                  <ListGroupItem key={interest.interestID}>
                    <Button
                      className={
                        this.props.interests.has(interest.interestID)
                          ? "interestButton btn btn-block btn-md btn-inverse "
                          : "interestButton btn btn-block btn-md btn-primary"
                      }
                      onClick={e => {
                        this.props.handleInterestSelection(e);
                      }}
                      value={interest.interestID}>
                      {interest.name}
                    </Button>
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </Col>
        </Row>
      </div>
    );
  }
}
