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
  Tooltip,
  Alert
} from "reactstrap";
import { RingLoader } from "react-spinners";
import { getBase64 } from "../utillity/helpers";

const DEFAULT_IMAGE =
  "https://humankind-assets.s3.eu-west-1.amazonaws.com/post/gr8QHk31k2Raa";

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
    loadingLocationButtonDisabled: false,
    //default image
    imageSource: DEFAULT_IMAGE,
    url: "",
    postID: null,
    updateButton: false,
    imageLoadError: null
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
        url: nextProps.postToUpdate[0].url,
        imageSource: nextProps.postToUpdate[0].imageSource,
        interests,
        loadingLocation: false,
        updateButton: true,
        uploadingImage: false,
        loadingLocationButtonDisabled: false
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
    }

    if (name === "location") {
      this.setState({
        loadingLocation: false
      });
    }

    this.setState({
      [name]: target.value
    });
  };

  handleSubmitRequest = e => {
    e.persist();

    const buttonText = e.target.textContent.trim();
    let {
      loadingLocation,
      updateButton,
      postTypeAskChecked,
      postTypeOfferChecked,
      selectedOptions,
      useCurrentLocationTooltipOpen,
      postID,
      uploadingImage,
      imageLoadError,
      locationError,
      loadingLocationButtonDisabled,
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

    fetch(url, {
      credentials: "same-origin",
      method: method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(post)
    })
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
              url: "",
              imageSource:
                "https://humankind-assets.s3.eu-west-1.amazonaws.com/post/gr8QHk31k2Raa",
              postTypeAskChecked: false,
              postTypeOfferChecked: false,
              updateButton: false,
              locationError: null,
              loadingLocationButtonDisabled: false
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
    const TIME_OUT_SECOND = 6000;
    const TIME_OUT_GEO_LOADING = 27000;
    this.setState({
      loadingLocationButtonDisabled: true
    });
    if (navigator.geolocation) {
      const geo_options = {
        enableHighAccuracy: true,
        timeout: TIME_OUT_GEO_LOADING
      };
      navigator.geolocation.getCurrentPosition(
        position => {
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
                this.setState({
                  loadingLocation: false,
                  loadingLocationButtonDisabled: false
                });
                throw new Error(
                  "Can't locate your location. Please, put it maually or try later"
                );
              }
            })
            .catch(err => {
              this.setState(
                {
                  locationError: "Error: " + err.message
                },
                () => {
                  setTimeout(() => {
                    this.setState({
                      locationError: null
                    });
                  }, TIME_OUT_SECOND);
                }
              );
            });
        },
        error => {
          // if(error.code===1){
          this.setState(
            {
              locationError: `Error: you need to allow us to use your browser's Geolocation`,
              loadingLocation: false,
              loadingLocationButtonDisabled: false
            },
            () => {
              setTimeout(() => {
                this.setState({
                  locationError: null
                });
              }, TIME_OUT_SECOND);
            }
          );
          // }
        },
        geo_options
      );
    } else {
      this.setState(
        {
          locationError: "Error: Geolocation is not supported by this browser."
        },
        () => {
          setTimeout(() => {
            this.setState({
              locationError: null
            });
          }, TIME_OUT_SECOND);
        }
      );
    }
  }

  handleImageSelection = e => {
    const TIME_OUT_SECOND = 6000;
    const files = e.target.files;
    getBase64(files[0]).then(res => {
      this.setState({
        uploadingImage: true
      });
      fetch(`/api/post/image`, {
        credentials: "same-origin",
        ContentType: "image/png",
        method: "POST",
        body: JSON.stringify({
          imageData: res
        })
      })
        .then(response => {
          return response.json();
        })
        .then(response => {
          if (response.message) {
            this.setState({
              uploadingImage: false
            });
            throw new Error(response.message);
          }
          this.setState({
            imageSource: response.imageSource,
            uploadingImage: false
          });
        })
        .catch(err => {
          this.setState(
            {
              imageLoadError: `Can't upload Image: the image size is very large or it is not of JPG/JPEG type`
            },
            () => {
              //clear the error message
              setTimeout(() => {
                this.setState({
                  imageLoadError: null
                });
              }, TIME_OUT_SECOND);
            }
          );
        });
    });
  };

  render() {
    return (
      <div id="post">
        <Row>
          <Col sm={1} />
          <Col sm={10} xs={12} id="postForm">
            <Form>
              <FormGroup row id="postPictureContainer">
                <Label for="postImageFile" sm={2} id="postImageLabel">
                  Picture
                </Label>
                <Col sm={10}>
                  <Col sm={12} id="postImageFile">
                    {this.state.uploadingImage ? (
                      <RingLoader
                        id="ringLoader"
                        color="#123abc"
                        loading={this.state.loading}
                        size={100} /*the size of the spinner*/
                      />
                    ) : (
                      <img
                        id="preview"
                        src={this.state.imageSource}
                        alt={"Post image"}
                      />
                    )}
                  </Col>
                  {this.state.imageLoadError ? (
                    <Row>
                      <Col sm={10} id="postImageFileInfo">
                        <Alert color="danger">
                          {" "}
                          {this.state.imageLoadError}
                        </Alert>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}
                  <Row id="uploadPostImageButton">
                    <Col>
                      <Input
                        type="file"
                        name="postImageFile"
                        id="upladPostImage"
                        accept=".jpg, .jpeg, .png"
                        onChange={this.handleImageSelection}
                      />
                    </Col>
                  </Row>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="content" sm={2}>
                  Content
                </Label>
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
                <Label for="postType" sm={2}>
                  <p>Type</p>
                </Label>
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
                <Label for="url" sm={2}>
                  &nbsp; URL&nbsp;
                </Label>
                <Col sm={5} xs={12}>
                  <Input
                    type="text"
                    name="url"
                    id="url"
                    placeholder="url for more information"
                    onChange={this.handleChange}
                    value={this.state.url}
                  />
                </Col>
                <Col sm={5} />
              </FormGroup>
              <FormGroup row>
                <Label for="timeRequired" sm={2}>
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
                <Col sm={5} />
              </FormGroup>
              <FormGroup row>
                <Label for="location" sm={2}>
                  &nbsp;Location&nbsp;
                </Label>
                <Col sm={5}>
                  <Input
                    type="textarea"
                    name="location"
                    id="location"
                    placeholder="e.g. London"
                    onChange={this.handleChange}
                    value={this.state.location}
                  />
                </Col>
                <Col xs={3} id="locationDetectIconContainer">
                  <Button
                    onClick={e => this.detectLocation(e)}
                    id="ToolTipUseCurrentLocationIcon"
                    disabled={this.state.loadingLocationButtonDisabled}
                    block>
                    Locate me&nbsp;
                    <i className="material-icons">add_location</i>
                  </Button>
                </Col>
                {this.state.loadingLocation ? (
                  <Col xs={1}>
                    <div className="RingLoader location-loading">
                      <RingLoader
                        color="#123abc"
                        loading={this.state.loading}
                        size={30} /*the size of the spinner*/
                      />
                    </div>
                  </Col>
                ) : (
                  ""
                )}
              </FormGroup>
              {this.state.locationError ? (
                <Row>
                  <Col sm={8} id="locationErrorInfo">
                    <Alert color="danger"> {this.state.locationError}</Alert>
                  </Col>
                </Row>
              ) : (
                ""
              )}
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
