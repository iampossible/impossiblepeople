import React, { Component } from "react";
import { PostInterestTags } from "./PostInterestTags";
import {
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Tooltip
} from "reactstrap";
import { RingLoader } from "react-spinners";
import currentUserAvatar from "../assets/images/profile.png";

export default class Post extends Component {
  state = {
    content: "",
    postType: "",
    location: "",
    latitude: 0,
    longitude: 0,
    timeRequired: "",
    interests: new Set(),
    loadingLocation: false,
    selectedOptions: [],
    useCurrentLocationTooltipOpen: false,
    postTypeAskChecked: false,
    postTypeOfferChecked: false,
    postID: null,
    updateButton: false
  };
  componentWillReceiveProps = nextProps => {
    if (nextProps.postToUpdate !== "") {
      let interests = nextProps.postToUpdate[0].interests.map(interest => {
        if (this.selectElement.props.children.length > 0) {
          Array.from(
            this.selectElement._reactInternalFiber.child.stateNode
          ).map(option => {
            if (option.value === interest.interestID) {
              option.className = "selectedTag";
            }
            return;
          });
        }
        return interest.interestID;
      });

      if (nextProps.postToUpdate[0].postType === "ASKS") {
        this.setState({
          postTypeAskChecked: true
        });
      } else if (nextProps.postToUpdate[0].postType === "OFFERS") {
        this.setState({
          postTypeOfferChecked: true
        });
      }
      this.setState({
        content: nextProps.postToUpdate[0].content,
        postType: nextProps.postToUpdate[0].postType,
        location: nextProps.postToUpdate[0].location,
        latitude: nextProps.postToUpdate[0].latitude,
        longitude: nextProps.postToUpdate[0].longitude,
        timeRequired: nextProps.postToUpdate[0].timeRequired,
        postID: nextProps.postToUpdate[0].postID,
        interests,
        loadingLocation: false,
        updateButton: true
      });
    }
  };
  detectLocation = e => {
    this.setState({
      loadingLocation: true
    });
    this.getLocation();
  };
  toggleUseCurrentLocationTooltip = () => {
    this.setState({
      useCurrentLocationTooltipOpen: !this.state.useCurrentLocationTooltipOpen
    });
  };
  //to handle multiple selection of Tags
  handleMultipleSelect = event => {
    //https://reactjs.org/docs/events.html#event-pooling
    event.persist();
    const target = event.target;
    //to avoid direct modification of state
    let interests = new Set(this.state.interests);

    if (
      !interests.has(target.value) ||
      (!interests.has(target.value) && event.metaKey) ||
      event.ctrlKey
    ) {
      interests.add(target.value);
      target.className = "selectedTag";
    } else if (interests.has(target.value)) {
      interests.delete(target.value);
      target.className = "unSelectedTag";
    }
    this.setState({
      interests: [...interests]
    });
  };

  handleChange = event => {
    event.persist();
    const target = event.currentTarget;
    const name = target.name;

    if (target.type === "radio") {
      if (target.value === "ASKS") {
        this.setState({
          postTypeAskChecked: true,
          postTypeOfferChecked: false
        });
      } else {
        this.setState({
          postTypeOfferChecked: true,
          postTypeAskChecked: false
        });
      }
    } //We may need an else statement here
    this.setState({
      [name]: target.value
    });
  };
  handleSubmitRequest = e => {
    e.persist();
    let buttonText = e.target.textContent.trim();
    //implement post
    //remove the redirect state when constructing the body of the request

    let {
      loadingLocation,
      updateButton,
      postTypeAskChecked,
      postTypeOfferChecked,
      selectedOptions,
      useCurrentLocationTooltipOpen,
      postID,
      ...post
    } = this.state;

    let url, method;
    if (buttonText === "Submit") {
      url = `/api/post/create`;
      method = "POST";
    } else if (buttonText === "Update") {
      url = `/api/post/update/${this.state.postID}`;
      method = "PUT";
    }
    // post.interests = [...this.state.interests];
    fetch(url, {
      credentials: "same-origin",
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post)
    })
      //just for see the result of the operation...needs to be removed
      .then(response => {
        if (response.status > 399) return { error: response.message };
        return response.json();
      })
      .then(response => {
        if (response) {
          this.setState(
            {
              content: "",
              postType: "",
              location: "",
              latitude: "",
              longitude: "",
              timeRequired: "",
              interests: [],
              postTypeAskChecked: false,
              postTypeOfferChecked: false,
              updateButton: false
            },
            () => {
              Array.from(
                this.selectElement._reactInternalFiber.child.stateNode
              ).map(option => {
                option.className = "unSelectedTag";
              });
              this.props.updateFeeds();
            }
          );
        }
      })
      .catch(err => console.error(err));
  };

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        fetch(`/api/location`, {
          credentials: "same-origin",
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        })
          .then(response => response.json())
          .then(location => {
            if (location.friendlyName) {
              this.setState({
                latitude: position.coords.latitude | 0,
                longitude: position.coords.longitude | 0,
                location: location.friendlyName,
                loadingLocation: false
              });
            } else {
              //display can't access your location at the moment
              throw new Error("Can't locate your location");
            }
          })
          .catch(err => console.log("Error: " + err.message));
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  render() {
    return (
      <div id="post">
        <Row>
          <Col sm={3} xs={12} id="organisationAvatar">
            <img
              src={this.props.user.imageSource || currentUserAvatar}
              width="100%"
              alt="Organisation Avatar"
            />
          </Col>
          <Col sm={8} xs={12} id="postForm">
            <Form>
              <FormGroup row>
                <Col sm={2} xs={12}>
                  <Label for="content">Content</Label>
                </Col>
                <Col sm={9} xs={12}>
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
                <Col sm={1} />
              </FormGroup>
              <FormGroup row>
                <Col xs={2}>
                  <Label for="postType">
                    <p>Type</p>
                  </Label>
                </Col>
                <Col xs={4}>
                  <Label check>
                    <Input
                      type="radio"
                      name="postType"
                      value="ASKS"
                      checked={this.state.postTypeAskChecked}
                      onChange={this.handleChange}
                    />&nbsp;&nbsp;&nbsp;&nbsp;ASK
                  </Label>
                </Col>
                <Col xs={4}>
                  <Label check>
                    <Input
                      type="radio"
                      name="postType"
                      value="OFFERS"
                      checked={this.state.postTypeOfferChecked}
                      onChange={this.handleChange}
                    />&nbsp;&nbsp;&nbsp;&nbsp;OFFER
                  </Label>
                </Col>
                <Col sm={2} />
              </FormGroup>
              <FormGroup row>
                <Label for="timeRequired" sm={2} xs={12}>
                  &nbsp; Duration&nbsp;
                </Label>
                <Col sm={5} xs={12}>
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
              <FormGroup row>
                <Col sm={2} xs={12}>
                  <Label for="location">&nbsp;Location&nbsp;</Label>
                </Col>
                <Col sm={8} xs={12}>
                  <Input
                    type="textarea"
                    name="location"
                    id="location"
                    placeholder="e.g. London"
                    onChange={this.handleChange}
                    value={this.state.location}
                  />
                </Col>
                <Col xs={1} id="locationDetectIconContainer">
                  <Button
                    onClick={e => this.detectLocation(e)}
                    id="ToolTipUseCurrentLocationIcon">
                    <i className="material-icons">add_location</i>
                  </Button>
                  <Tooltip
                    placement="top"
                    isOpen={this.state.useCurrentLocationTooltipOpen}
                    target="ToolTipUseCurrentLocationIcon"
                    toggle={this.toggleUseCurrentLocationTooltip}>
                    Use Current Location
                  </Tooltip>
                </Col>
                <Col xs={1}>
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
              <PostInterestTags
                onClick={this.handleMultipleSelect}
                tagsRef={el => {
                  this.selectElement = el;
                }}
              />
              <FormGroup row>
                <Col sm={2} />
                <Col sm={9} xs={12} className="submitPost">
                  <hr />
                  <Button
                    onClick={this.handleSubmitRequest}
                    disabled={
                      // a more accurate validation for location is needed
                      this.state.location !== "" ? false : true
                    }>
                    &nbsp; &nbsp; &nbsp;
                    {this.state.updateButton ? "Update" : "Submit"}&nbsp; &nbsp;
                    &nbsp;
                  </Button>
                </Col>
              </FormGroup>
            </Form>
          </Col>
          <Col sm={1} />
        </Row>
      </div>
    );
  }
}
