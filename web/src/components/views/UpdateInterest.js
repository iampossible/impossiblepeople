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
      user_s_Interests: [],
      loading: true
    };
  }

  //to handle the selection when the button is clicked
  handleSelection(evt) {
    //get the interestID from the button selected/clicked
    let user_s_InterestID = evt.target.value;

    let user_s_Interests = this.state.user_s_Interests;

    if (!user_s_Interests.includes(user_s_InterestID)) {
      user_s_Interests.push(user_s_InterestID);
    } else {
      let index = user_s_Interests.indexOf(user_s_InterestID);
      if (index !== -1) {
        user_s_Interests.splice(index, 1);
      }
    }

    this.setState({
      user_s_Interests
    });
  }
  componentWillMount() {
    //load all the featured interests from the DB
    fetch(`/api/interest`, {
      credentials: "same-origin"
    })
      .then(response => {
        if (response.status === 401) 
          this.props.history.push("/")
        if (response.status > 399)
          return [];
        return response.json();
      })
      .then(response => {
        let featuredInterests = response;
        let previousInterests = [];
        if (this.props.user && this.props.user.hasOwnProperty('interests')) {
          this.props.user.interests.forEach(interest => {
            previousInterests.push(interest.interestID);
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
      interests: this.state.user_s_Interests
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
          for (let i = 0; i < this.state.user_s_Interests.length; i++) {

            this.state.featuredInterests.forEach(featuredInterest => {
              if (
                featuredInterest.interestID === this.state.user_s_Interests[i]
              ) {
                let index = this.state.user_s_Interests.indexOf(
                  this.state.user_s_Interests[i]
                );
                if (index !== -1) {
                  //remove the id
                  this.state.user_s_Interests.splice(i, 1);
                  //replace it with the interest object
                  this.state.user_s_Interests.splice(i, 0, featuredInterest);
                }
              }
            });
          }
          return this.state.user_s_Interests;
        })();

        this.redirectOnSubmit(this.props.user.userType);
      })
      .catch(err => console.error(err));
  };
  redirectOnSubmit = userType => {
    let user = Object.assign({}, this.props.user);
    this.props.history.push("/feed");
  };
  render() {
    const { featuredInterests, user_s_Interests } = this.state;
    return this.state.loading ? (
      <Row>
        <Col xs={4} />
        <Col xs={4} className="feedRingLoader">
          <div className="RingLoader center-loading">
            <RingLoader
              color="#e0a800"
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
          <Col sm={{ size: 1 }} />
          <Col sm={{ size: 10 }} xs={12}>
            <ListGroup
              id="lists"
              className="d-flex flex-row flex-wrap align-content-center"
            >
              {featuredInterests.map((interest, index) => {
                let i = 0;
                for (; i < user_s_Interests.length; i++) {
                  if (interest.interestID === user_s_Interests[i]) {
                    return (
                      <ListGroupItem key={interest.interestID}>
                        <Button
                          size="sm"
                          className="previousInterest"
                          onClick={e => {
                            this.handleSelection(e);
                          }}
                          value={interest.interestID}
                        >
                          {interest.name}
                        </Button>
                      </ListGroupItem>
                    );
                  }
                }
                if (!user_s_Interests.includes(interest.interestID)) {
                  return (
                    <ListGroupItem key={interest.interestID}>
                      <Button
                        size="sm"
                        className="interestTypesButton"
                        onClick={e => {
                          this.handleSelection(e);
                        }}
                        value={interest.interestID}
                      >
                        {interest.name}
                      </Button>
                    </ListGroupItem>
                  );
                }
              })}
            </ListGroup>
            <hr />
          </Col>
          <Col sm={1} />
        </Row>
        <Form id="selectUserType">
          <FormGroup row>
            <Col sm={{ size: 4 }} />
            <Col sm={{ size: 4 }}>
              <Button color="warning" onClick={this.handleSubmitRequest}>
                &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
              </Button>
            </Col>
            <Col sm={{ size: 4 }} />
          </FormGroup>
        </Form>
      </div>
    );
  }
}
