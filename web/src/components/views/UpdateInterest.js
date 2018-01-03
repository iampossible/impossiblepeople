import React, { Component } from "react";
import {
  Button,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormGroup
} from "reactstrap";
import { RingLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.css";

export default class UpdateInterest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredInterests: [],
      //to hold the interests that the user picks as an update to his/her previous interest
      user_s_Interests: new Set(),
      loading: true
    };
  }

  //to handle the selection when the button is clicked
  handleSelection(evt) {
    //get the interestID from the button selected/clicked
    let user_s_InterestID = evt.target.value;

    let user_s_Interests = new Set(this.state.user_s_Interests);

    if (!user_s_Interests.has(user_s_InterestID)) {
      user_s_Interests.add(user_s_InterestID);
    } else {
      user_s_Interests.delete(user_s_InterestID);
    }

    this.setState({
      user_s_Interests
    });
  }
  componentDidMount() {
    //load all the featured interests from the DB
    const user = this.props.user;

    console.log(user, user.hasOwnProperty("interests"));
    fetch(`/api/interest`, {
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 401) this.props.history.push("/");
        if (response.status > 399) return [];
        return response.json();
      })
      .then(response => {
        let featuredInterests = response;
        let previousInterests = new Set();

        if (user && user.hasOwnProperty("interests")) {
          user.interests.forEach(interest => {
            previousInterests.add(interest.interestID);
          });
        }
        this.setState({
          featuredInterests,
          user_s_Interests: previousInterests,
          loading: false
        });
      });
  }
  handleSubmitRequest = e => {
    e.preventDefault();

    //the parameter needs to be a JSON
    let interests = JSON.stringify({
      interests: [...this.state.user_s_Interests]
    });
    //add users interest
    fetch(`/api/user/interest`, {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: interests
    })
      //just for see the result of the operation...needs to be removed
      .then(response => response.json())
      .then(response => {
        //modify the interest that will be passed through the location props
        this.props.user.interests = (() => {
          let user_s_InterestIDs = [...this.state.user_s_Interests];
          for (let i = 0; i < user_s_InterestIDs.length; i++) {
            this.state.featuredInterests.forEach(featuredInterest => {
              if (featuredInterest.interestID === user_s_InterestIDs[i]) {
                let index = user_s_InterestIDs.indexOf(user_s_InterestIDs[i]);
                if (index !== -1) {
                  //remove the id
                  user_s_InterestIDs.splice(i, 1);
                  //replace it with the interest object
                  user_s_InterestIDs.splice(i, 0, featuredInterest);
                }
              }
            });
          }
          return user_s_InterestIDs;
        })();

        this.redirectOnSubmit(this.props.user.userType);
      })
      .catch(err => console.error(err));
  };
  handleCancelRequest = e => {
    this.props.history.push("/feed");
  };
  redirectOnSubmit = userType => {
    let user = Object.assign({}, this.props.user);
    this.props.history.push("/feed");
  };
  render() {
    const { featuredInterests, user_s_Interests } = this.state;

    return this.state.loading ? (
      <Row id="updateInterestRingLoader">
        <Col xs={4} />
        <Col xs={4}>
          <div className="RingLoader center-loading">
            <RingLoader
              color="#123abc"
              loading={this.state.loaded}
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
              {featuredInterests.map((interest, index) => {
                return (
                  <ListGroupItem key={interest.interestID}>
                    <Button
                      className={
                        this.state.user_s_Interests.has(interest.interestID)
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
        <Form id="selectUserType">
          <FormGroup row>
            <Col sm={7} />
            <Col sm={2}>
              <Button
                id="submitUpdateInterest"
                onClick={this.handleSubmitRequest}
              >
                &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
              </Button>
            </Col>
            <Col sm={2}>
              <Button
                id="cancelUpdateInterest"
                onClick={this.handleCancelRequest}
              >
                &nbsp;&nbsp;&nbsp;Cancel &nbsp;&nbsp;&nbsp;
              </Button>
            </Col>
            <Col sm={1} />
          </FormGroup>
        </Form>
      </div>
    );
  }
}
