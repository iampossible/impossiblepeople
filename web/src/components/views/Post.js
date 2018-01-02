import React, { Component } from "react";
import { PostInterestTags } from "../PostInterestTags";
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

export default class Post extends Component {
  state = {
    content: "",
    postType: "",
    location: "",
    latitude: 0,
    longitude: 0,
    timeRequired: "",
    //to hold the selected interests ID for the post
    interestID: new Set(),
    loadingLocation: false,
    selectedOptions: [],
    useCurrentLocationTooltipOpen: false
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
    let interestID = new Set(this.state.interestID);
    console.log(interestID);
    console.log(target.value);

    if (
      !interestID.has(target.value) ||
      (!interestID.has(target.value) && event.metaKey) ||
      event.ctrlKey
    ) {
      interestID.add(target.value);
      target.className = "selectedTag";
    } else if (interestID.has(target.value)) {
      interestID.delete(target.value);
      target.className = "unSelectedTag";
    }
    this.setState({
      interestID: [...interestID]
    });
  };

  handleChange = event => {
    event.persist();
    const target = event.currentTarget;
    const name = target.name;
    //if it is not a select element modify the element whose value is changed
    this.setState({
      [name]: target.value
    });
  };
  handleSubmitRequest = e => {
    e.persist();
    let {
      loadingLocation,
      selectedOptions,
      useCurrentLocationTooltipOpen,
      ...post
    } = this.state;
    post.interestID = [...this.state.interestID];
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
          this.setState(
            {
              content: "",
              postType: "",
              location: "",
              latitude: "",
              longitude: "",
              timeRequired: "",
              interestID: []
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
          .then(jsonResponse => {
            if (jsonResponse.friendlyName) {
              this.setState({
                latitude: position.coords.latitude | 0,
                longitude: position.coords.longitude | 0,
                location: jsonResponse.friendlyName,
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
          <Col sm={3} xs={12} id="organisationAvatar">
            <img
              src={this.props.user.imageSource}
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
                      ref={radio => {
                        this.radio = radio;
                      }}
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
                    id="ToolTipUseCurrentLocationIcon"
                  >
                    <i className="material-icons">add_location</i>
                  </Button>
                  <Tooltip
                    placement="top"
                    isOpen={this.state.useCurrentLocationTooltipOpen}
                    target="ToolTipUseCurrentLocationIcon"
                    toggle={this.toggleUseCurrentLocationTooltip}
                  >
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
                  <Button onClick={this.handleSubmitRequest}>
                    &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
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
