import React, { Component } from "react";
import { PostInterestTags } from "../PostInterestTags";
import { Row, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { Redirect } from "react-router-dom";

export default class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      postType: "",
      location: "",
      latitude: "",
      longitude: "",
      timeRequired: "",
      //to hold the selected interests ID for the post
      interestID: [],
      redirect: false
    };
    this.handleSubmitRequest = this.handleSubmitRequest.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  onFocus(e) {
    this.getLocation();
  }
  handleChange(event) {
    const target = event.target;
    const name = target.name;
    //if it is a select-multi type since multiple options can be selected
    if (target.type === "select-multiple") {
      let interest = this.state.interestID;
      if (!interest.includes(target.value)) {
        interest.push(target.value);
      }
      this.setState({
        interestID: interest
      });
    } else {
      //if it is not a select element modify the element whose value is changed
      this.setState({
        [name]: target.value
      });
    }
  }
  handleSubmitRequest(e) {
    //implement post
    //remove the redirect state when constructing the body of the request
    let { redirect, ...post } = this.state;
    fetch(`/api/post/create`, {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post)
    })
      //just for see the result of the operation...needs to be removed
      .then(response => response.json())
      .then(response => {
        if (response) {
          this.setState({
            redirect: true
          });
        }
      })
      .catch(err => console.error(err));
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  render() {
    return this.state.redirect ? (
      <Redirect to="/feed" />
    ) : (
      <div id="post">
        <Row>
          <Col sm={3} xs={12} id="organisationAvatar">
            {/* <img
              src={this.props.currentUser.imageSource}
              width="100%"
              alt={""}
            /> */}
          </Col>

          <Col sm={8} xs={12} id="postForm">
            <Form>
              <FormGroup row>
                <Label for="content" sm={{ size: 2 }} xs={12}>
                  Content
                </Label>
                <Col sm={{ size: 8 }} xs={12}>
                  <Input
                    type="textarea"
                    name="content"
                    style={{ height: 100, width: "100%" }}
                    id="postContent"
                    placeholder="Have something to Ask or Offer?"
                    onChange={this.handleChange}
                    className="inputBG"
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={2} xs={4}>
                  <Label>
                    <p>Type</p>
                  </Label>
                </Col>
                <Col sm={4} xs={4}>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="postType"
                        value="ASKS"
                        onChange={this.handleChange}
                      />&nbsp;&nbsp;&nbsp;&nbsp;ASK
                    </Label>
                  </FormGroup>
                </Col>
                <Col sm={5} xs={4}>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="radio"
                        name="postType"
                        value="OFFERS"
                        onChange={this.handleChange}
                      />&nbsp;&nbsp;&nbsp;&nbsp;OFFER
                    </Label>
                  </FormGroup>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="location" sm={2} xs={12}>
                  {" "}
                  Location{" "}
                </Label>
                <Col sm={5} xs={12}>
                  <Input
                    type="text"
                    name="location"
                    id="location"
                    placeholder="e.g. London"
                    onChange={this.handleChange}
                    className="inputBG"
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                {/* will be replaced by detecting user Geolocation */}
                <Label for="latitude" sm={{ size: 2 }} xs={12}>
                  {" "}
                  Latitude{" "}
                </Label>
                <Col sm={5} xs={12}>
                  <Input
                    type="text"
                    name="latitude"
                    id="latitude"
                    placeholder="e.g. 51.533333"
                    onChange={this.handleChange}
                    onFocus={e => this.onFocus(e)}
                    value={this.state.latitude}
                    className="inputBG"
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                {/* will be replaced by detecting user Geolocation */}
                <Label for="longitude" sm={2} xs={12}>
                  {" "}
                  Longitude{" "}
                </Label>
                <Col sm={5} xs={12}>
                  <Input
                    type="text"
                    name="longitude"
                    id="longitude"
                    placeholder="e.g. -0.132231"
                    onChange={this.handleChange}
                    onFocus={e => this.onFocus(e)}
                    value={this.state.longitude}
                    className="inputBG"
                  />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="timeRequired" sm={{ size: 2 }}>
                  {" "}
                  Duration{" "}
                </Label>
                <Col sm={5} xs={12}>
                  <Input
                    type="text"
                    name="timeRequired"
                    id="timeRequired"
                    placeholder="e.g. 10"
                    onChange={this.handleChange}
                    className="inputBG"
                  />
                </Col>
              </FormGroup>
              <PostInterestTags onChange={this.handleChange} />
              <FormGroup row>
                <Col sm={2} />
                <Col sm={5} xs={12} className="submitPost">
                  <hr />
                  <Button color="warning" onClick={this.handleSubmitRequest}>
                    &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
                  </Button>
                </Col>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}
