import React, { Component } from "react";
import { PostInterestTags } from "./PostInterestTags";
import { Row, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { RingLoader } from "react-spinners";

export default class Post extends Component {
  state = {
    content: "",
    postType: "",
    location: "",
    latitude: 0,
    longitude: 0,
    timeRequired: "",
    //to hold the selected interests ID for the post
    interests: [],
    loadingLocation: false
  };

  detectLocation = e => {
    this.setState({
      loadingLocation: true
    });
    this.getLocation();
  };
  handleChange = event => {
    const target = event.currentTarget;

    const name = target.name;
    //if it is a select-multi type since multiple options can be selected
    if (target.type === "select-multiple") {
      this.setState({
        interests: [...target.selectedOptions].map(option => option.value)
      });
    } else {
      //if it is not a select element modify the element whose value is changed
      this.setState({
        [name]: target.value
      });
    }
  };
  handleSubmitRequest = e => {
    //implement post
    //remove the redirect state when constructing the body of the request
    let { loadingLocation, ...post } = this.state;
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
          this.props.updateFeeds();
          this.setState({
            content: "",
            postType: "",
            location: "",
            latitude: "",
            longitude: "",
            timeRequired: "",
            interests: []
          });
        }
      })
      .catch(err => console.error(err));
  };

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const GEOCODING =
          "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCR_cUWKEGoLxUi5rUNzHfEihZLdHu7qfM&latlng=" +
          position.coords.latitude +
          "%2C" +
          position.coords.longitude +
          "&language=en";
        fetch(GEOCODING)
          .then(response => response.json())
          .then(jsonResponse => {
            if (jsonResponse.status === "OK") {
              console.log(jsonResponse);
              this.setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                location: jsonResponse.results[7].formatted_address,
                loadingLocation: false
              });
            } else {
              //display can't access your location at the moment
              console.log("ERROR");
            }
          });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  render() {
    return (
      <div id="post">
        <Row>
          <Col sm={2} />
          <Col sm={3} xs={12} id="organisationAvatar">
            <img src={this.props.user.imageSource} width="100%" alt={""} />
          </Col>

          <Col sm={7} xs={12} id="postForm">
            <Form>
              <FormGroup row>
                <Label for="content" sm={{ size: 2 }} xs={12}>
                  Content
                </Label>
                <Col sm={8} xs={12}>
                  <Input
                    type="textarea"
                    name="content"
                    style={{ height: 100, width: "100%" }}
                    id="postContent"
                    placeholder="Have something to Ask or Offer?"
                    onChange={this.handleChange}
                    value={this.state.content}
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
                        ref={radio => {
                          this.radio = radio;
                        }}
                        onChange={this.handleChange}
                      />&nbsp;&nbsp;&nbsp;&nbsp;OFFER
                    </Label>
                  </FormGroup>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="location" sm={2} xs={12}>
                  &nbsp;Location&nbsp;
                </Label>
                <Col sm={5} xs={5}>
                  <Input
                    type="textarea"
                    name="location"
                    id="location"
                    placeholder="e.g. London"
                    onChange={this.handleChange}
                    value={this.state.location}
                  />
                </Col>
                <Col sm={4} xs={4}>
                  <Button onClick={e => this.detectLocation(e)}>
                    Use my Current Location
                  </Button>
                </Col>
                <Col sm={1} xs={1}>
                  {this.state.loadingLocation ? (
                    <div className="RingLoader location-loading">
                      <RingLoader
                        color="#123abc"
                        loading={this.state.loading}
                        size={30} /*the size of the spinner*/
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </Col>
              </FormGroup>

              <FormGroup row>
                <Label for="timeRequired" sm={{ size: 2 }}>
                  &nbsp; Duration&nbsp;
                </Label>
                <Col sm={6} xs={12}>
                  <Input
                    type="text"
                    name="timeRequired"
                    id="timeRequired"
                    placeholder="e.g. 10"
                    onChange={this.handleChange}
                    value={this.state.timeRequired}
                  />
                </Col>
              </FormGroup>
              <PostInterestTags onChange={this.handleChange} />
              <FormGroup row>
                <Col sm={2} />
                <Col sm={5} xs={12} className="submitPost">
                  <hr />
                  <Button onClick={this.handleSubmitRequest}>
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
