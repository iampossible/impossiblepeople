import React, { Component } from 'react';
import { PostInterestTags } from './PostInterestTags';
import {
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert
} from 'reactstrap';
import { RingLoader } from 'react-spinners';
import { getBase64 } from '../utillity/helpers';

export default class Post extends Component {
  state = {
    content: '',
    postType: '',
    location: '',
    latitude: 0,
    longitude: 0,
    timeRequired: 0,
    interests: new Set(),
    loadingLocation: false,
    useCurrentLocationTooltipOpen: false,
    postTypeAskChecked: true,
    postTypeOfferChecked: false,
    loadingLocationButtonDisabled: false,
    //default image
    imageSource:'',
    url: '',
    postID: null,
    updateButton: false,
    imageLoadError: null,
    postTypeDispalyText: '',
    postError: null
  };

  componentDidMount(){
 
    let Images={
    0:'https://www.planwallpaper.com/static/images/offset_WaterHouseMarineImages_62652-2-660x440.jpg',
    1:'https://www.planwallpaper.com/static/images/images_1_05GM1zY.jpg',
    2:'https://www.planwallpaper.com/static/images/canberra_hero_image_JiMVvYU.jpg',
    3:'https://www.planwallpaper.com/static/images/6775415-beautiful-images.jpg',
    4:'https://www.planwallpaper.com/static/images/9-credit-1.jpg',
    5:'https://www.planwallpaper.com/static/images/background-gmail-google-images_FG2XwaO.jpg',
    6:'https://www.w3schools.com/w3css/img_fjords.jpg',
    7:'https://www.w3schools.com/w3css/img_lights.jpg',
    8:'https://www.elastic.co/assets/bltada7771f270d08f6/enhanced-buzz-1492-1379411828-15.jpg',
    9:'http://images.all-free-download.com/images/graphiclarge/canoe_water_nature_221611.jpg',
    10:'http://images.all-free-download.com/images/graphiclarge/landscape_meadow_nature_216362.jpg' 
    }
       
    const getRandomImage=()=>{
      let imagesLength=Object.keys(Images).length ;
      let randomNum = Math.floor((Math.random() * imagesLength));
  
      this.setState({
        imageSource:Images[randomNum]
      })  
    }

    getRandomImage();
    
}
  
  componentWillMount() {
    let interests = new Set();
    this.props.user.interests.map(interest =>
      interests.add(interest.interestID)
    );
    this.setState({
      postType: 'ASKS',
      postTypeDispalyText: 'What do you want to Ask?',
      interests: [...interests]
    });
    if (this.props.postToUpdate !== '') {
      this.updatePostContent(this.props.postToUpdate[0]);
    }
  }

  updatePostContent = post => {
    let interests = post.interests.map(interest => {
      if (interest.length > 0) {
        Array.from(this.selectElement._reactInternalFiber.child.stateNode).map(
          option => {
            if (option.value === interest.interestID) {
              option.className = 'selectedTag';
            }
            return;
          }
        );
      }
      return interest.interestID;
    });

    if (post.postType === 'ASKS') {
      this.setState({
        postTypeAskChecked: true,
        postTypeOfferChecked: false
      });
    } else if (post.postType === 'OFFERS') {
      this.setState({
        postTypeOfferChecked: true,
        postTypeAskChecked: false
      });
    }
    this.setState({
      content: post.content,
      postType: post.postType,
      location: post.location,
      latitude: post.latitude,
      longitude: post.longitude,
      timeRequired: post.timeRequired,
      postID: post.postID,
      url: post.url,
      imageSource: post.imageSource,
      interests,
      loadingLocation: false,
      updateButton: true,
      uploadingImage: false,
      loadingLocationButtonDisabled: false
    });
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
      target.className = 'selectedTag';
    } else if (interests.has(target.value)) {
      interests.delete(target.value);
      target.className = 'unSelectedTag';
    }
    this.setState({
      interests: [...interests]
    });
  };

  handleChange = event => {
    event.persist();
    const target = event.currentTarget;
    const name = target.name;

    if (name === 'location') {
      this.setState({
        loadingLocation: false
      });
    }

    this.setState({
      [name]: target.value
    });
  };

  handleAskAndOffer = event => {
    event.persist();
    if (event.target.value === 'ASKS') {
      this.setState({
        postTypeAskChecked: true,
        postType: 'ASKS',
        postTypeOfferChecked: false,
        postTypeDispalyText: 'What do you want to Ask?'
      });
    } else {
      this.setState({
        postType: 'OFFERS',
        postTypeOfferChecked: true,
        postTypeAskChecked: false,
        postTypeDispalyText: 'What can you offer?'
      });
    }
  };

  handleSubmitRequest = e => {
    e.persist();
    let error = [];
    if (this.state.content === '') {
      error.push('You need to put the content of your post');
    }
    if (this.state.interests.length === 0) {
      error.push("You need select at least the 'Other' interest category");
    }

    if (error.length > 0) {
      this.setState(
        {
          postError: error
        },
        () => {
          //clear the error message
          setTimeout(() => {
            this.setState({
              postError: ''
            });
          }, 5000);
        }
      );
    } else {
      const buttonText = e.target.textContent.trim();
      let {
        loadingLocation,
        updateButton,
        postTypeAskChecked,
        postTypeOfferChecked,

        useCurrentLocationTooltipOpen,
        postID,
        uploadingImage,
        imageLoadError,
        locationError,
        loadingLocationButtonDisabled,
        postTypeDispalyText,
        postError,
        ...post
      } = this.state;

      let url, method;
      if (buttonText === 'Post') {
        url = `/api/post/create`;
        method = 'POST';
      } else if (buttonText === 'Update') {
        url = `/api/post/update/${this.state.postID}`;
        method = 'PUT';
      }

      fetch(url, {
        credentials: 'same-origin',
        method: method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
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
                content: '',
                postType: '',
                location: '',
                latitude: '',
                longitude: '',
                timeRequired: 0,
                interests: [],
                url: '',
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
                  option.className = 'unSelectedTag';
                });
                this.props.updateFeeds();
                this.props.loadingPost();
                window.scrollTo(0, 0);
              }
            );
          }
        })
        .catch(err => console.error(err));
    }
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
            credentials: 'same-origin',
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
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
                  locationError: 'Error: ' + err.message
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
          locationError: 'Error: Geolocation is not supported by this browser.'
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
        credentials: 'same-origin',
        ContentType: 'image/png',
        method: 'POST',
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
              imageLoadError: `Can't upload Image: the image size is very large or it is not of JPG/JPEG/PNG type`
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

  handleClosePopup = () => {
    this.props.loadingPost();
    window.scrollTo(0, 0);
  };

  render() {
    return (
      <div id="popup">
        <div id="post" className="popupInner">
          <Row>
            <Row>
              <Col sm={1} />
              <Col id="postForm" sm={10}>
                <span id="closePostPopup" onClick={this.handleClosePopup}>
                  &nbsp;<i
                    className="fa fa-times-circle-o"
                    aria-hidden="true"
                  />
                </span>
                <div id="askAndOffer">
                  <Button
                    className="askandoffres__button"
                    onClick={e => {
                      this.handleAskAndOffer(e);
                    }}
                    name="postType"
                    value="ASKS"
                    active={this.state.postTypeAskChecked}>
                    ASKS
                  </Button>
                  <Button
                    className="askandoffres__button"
                    onClick={e => {
                      this.handleAskAndOffer(e);
                    }}
                    name="postType"
                    value="OFFERS"
                    active={this.state.postTypeOfferChecked}>
                    OFFERS
                  </Button>
                </div>
                <FormGroup>
                  <Label for="content">{this.state.postTypeDispalyText}</Label>
                  <Col id="textArea">
                    <Input
                      type="textarea"
                      name="content"
                      // style={{ height: 100, width: "100%" }}
                      id="postContent"
                      placeholder="eg. I can give drawing lesson "
                      onChange={this.handleChange}
                      value={this.state.content}
                    />
                  </Col>
                  <Col sm={1} />
                </FormGroup>
                <Form>
                  <FormGroup id="postPictureContainer">
                    <Label for="postImageFile" id="postImageLabel">
                      Image (must be in .png, .jpg or jpeg 740px x 250px)
                    </Label>
                    <div>
                      <Col id="postImageFile">
                        {this.state.uploadingImage ? (
                          <span id="postUploadImageringLoader">
                            <RingLoader
                              color="#123abc"
                              loading={this.state.loading}
                              size={50} /*the size of the spinner*/
                            />
                          </span>
                        ) : (
                          <img
                            id="preview"
                            src={this.state.imageSource}
                            alt={'Post'}
                          />
                        )}
                      </Col>
                      {this.state.imageLoadError ? (
                        <Row>
                          <Col sm={10} id="postImageFileInfo">
                            <Alert color="danger">
                              {this.state.imageLoadError}
                            </Alert>
                          </Col>
                        </Row>
                      ) : (
                        ''
                      )}
                      <Row id="uploadPostImageButton">
                        <label id="uploadImage">
                          <u>Edit</u>
                          <Input
                            type="file"
                            name="postImageFile"
                            id="uploadPostImage"
                            accept=".jpg, .jpeg, .png"
                            onChange={this.handleImageSelection}
                          />
                        </label>
                      </Row>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="location">&nbsp;Location&nbsp;</Label>
                    <Col>
                      <Input
                        type="textarea"
                        name="location"
                        id="location"
                        placeholder="eg. Vauxhall, London"
                        onChange={this.handleChange}
                        value={this.state.location}
                      />
                      <Button
                        onClick={e => this.detectLocation(e)}
                        id="ToolTipUseCurrentLocationIcon"
                        disabled={this.state.loadingLocationButtonDisabled}
                        className="btn btn-md btn-success">
                        {this.state.loadingLocation ? (
                          <div className="RingLoader location-loading">
                            <RingLoader
                              color="#123abc"
                              loading={this.state.loading}
                              size={30} /*the size of the spinner*/
                            />
                          </div>
                        ) : (
                          <span>
                            Locate me&nbsp;
                            <i className="material-icons">add_location</i>
                          </span>
                        )}
                      </Button>
                    </Col>
                  </FormGroup>
                  {this.state.locationError ? (
                    <Row>
                      <Col id="locationErrorInfo">
                        <Alert color="danger">{this.state.locationError}</Alert>
                      </Col>
                    </Row>
                  ) : (
                    ''
                  )}
                  <FormGroup>
                    <Label for="url">&nbsp; URL&nbsp;</Label>
                    <Col>
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

                  <PostInterestTags
                    interests={new Set(this.state.interests)}
                    onClick={this.handleMultipleSelect}
                    tagsRef={el => {
                      this.selectElement = el;
                    }}
                  />
                  <FormGroup>
                    <Col />
                    <Col className="submitPost">
                      <hr />
                      <Button
                        onClick={this.handleSubmitRequest}
                        className="submit btn btn-block btn-md"
                        disabled={
                          // a more accurate validation for location is needed
                          this.state.location !== '' ? false : true
                        }>
                        &nbsp; &nbsp; &nbsp;
                        {this.state.updateButton ? 'Update' : 'Post'}&nbsp;
                        &nbsp; &nbsp;
                      </Button>
                    </Col>
                    <Col sm={4} />
                  </FormGroup>
                  {this.state.postError && this.state.postError.length > 0 ? (
                    <Row>
                      <Col sm={1} />
                      <Col sm={10} className="createUserError">
                        <Alert color="danger">
                          {this.state.postError.map((error, i) => (
                            <p key={i}>&ndash;{error}</p>
                          ))}
                        </Alert>
                      </Col>
                      <Col sm={1} />
                    </Row>
                  ) : (
                    ''
                  )}
                </Form>
              </Col>
              <Col sm={1} />
            </Row>
          </Row>
        </div>
      </div>
    );
  }
}
