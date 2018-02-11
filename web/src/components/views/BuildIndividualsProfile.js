import React, { Component } from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  FormText,
  Button,
  Label,
  Input,
  Alert
} from "reactstrap";
import Interest from "./Interest";
import { RingLoader } from "react-spinners";
import { getBase64 } from "../../utillity/helpers";
import { handleErrors } from "../../utillity/helpers";

export default class BuildIndividualsProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: this.props.user.firstName ? this.props.user.firstName : "",
      lastName: this.props.user.lastName ? this.props.user.lastName : "",
      description: this.props.user.description
        ? this.props.user.description
        : "",
      url: this.props.user.url ? this.props.user.url : "",
      imageSource: this.props.user.imageSource
        ? this.props.user.imageSource
        : "",
      interests: this.props.user.interests
        ? new Set(
            this.props.user.interests.map(interest => interest.interestID)
          )
        : "",
      uploadingImage: false,
      imageLoadError: null
    };
  }

  componentWillReceiveProps(nextProp) {
    let interests = new Set();
    if (nextProp.user.interests) {
      nextProp.user.interests.forEach(interest => {
        interests.add(interest.interestID);
      });
      this.setState({
        firstName: nextProp.user.firstName,
        lastName: nextProp.user.lastName,
        description: nextProp.user.description,
        url: nextProp.user.url,
        imageSource: nextProp.user.imageSource,
        interests: interests
      });
    }
  }
  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value
    });
  };

  //to handle the selection when the button is clicked
  handleInterestSelection = evt => {
    let interestID = evt.target.value;
    let interests = new Set(this.state.interests);
    if (interests.has(interestID)) {
      interests.delete(interestID);
      this.setState({ interests });
    } else {
      interests.add(interestID);
      this.setState({ interests });
    }
  };

  handleImageSelection = e => {
    const TIME_OUT_SECOND = 6000;
    const files = e.target.files;
    getBase64(files[0]).then(res => {
      this.setState({
        uploadingImage: true
      });
      fetch(`/api/user/image`, {
        credentials: "same-origin",
        ContentType: "image/jpeg",
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

  handleSubmitRequest = e => {
    fetch(`/api/user`, {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        description: this.state.description,
        url: this.state.url
      })
    })
      .then(response => response.json())
      .then(response => {
        this.updateUserInterest(response);
      })
      .catch(err => console.error(err));
  };

  updateUserInterest = user => {
    fetch(`/api/user/interest`, {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        interests: [...this.state.interests]
      })
    })
      //just for see the result of the operation...needs to be removed
      .then(handleErrors)
      .then(response => {
        this.setState({
          upladingImage: false
        });
        return response.json();
      })
      .then(response => {
        //modify the value of the current user's interests
        user.interests = response.interests;
        this.redirectOnSubmit(user);
      })
      .catch(err => console.error(err));
  };

  redirectOnSubmit = user => {
    this.props.setUser(user);
    this.props.history.push("/feed");
  };

  isPageRady = () => {
    return this.props.user.interests;
  };

  render() {
    return !this.isPageRady() ? (
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
      <Row id="profile">
        <Col sm={1} />
        <Col sm={10}>
          <Form>
            <FormGroup row id="profilePictureContainer">
              <Label for="profileImage" sm={2} id="profilePictureLabel">
                Profile Picture
              </Label>
              <Col sm={10}>
                <Row>
                  <Col sm={5} id="profilePicture">
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
                        src={
                          this.state.imageSource !== ""
                            ? this.state.imageSource
                            : this.props.user.imageSource
                        }
                        alt={this.state.firstName}
                      />
                    )}
                  </Col>
                  <Col sm={7} id="profilePictureInfo">
                    <FormText color="muted">
                      If you don&apos;t upload your profile picture the one
                      displayed above will be used by default
                    </FormText>
                    <br />
                    {this.state.imageLoadError ? (
                      <Alert color="danger"> {this.state.imageLoadError}</Alert>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
                <Row id="uploadButton">
                  <Col>
                    <Input
                      type="file"
                      name="profileImage"
                      id="profileImage"
                      accept=".jpg, .jpeg, .png"
                      onChange={this.handleImageSelection}
                    />
                  </Col>
                </Row>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="firstName" sm={2}>
                First Name
              </Label>
              <Col sm={6}>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={this.state.firstName}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={3} />
            </FormGroup>
            <FormGroup row>
              <Label for="lastName" sm={2}>
                Last Name
              </Label>
              <Col sm={6}>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={this.state.lastName}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={3} />
            </FormGroup>
            <FormGroup row>
              <Label for="url" sm={2}>
                Url
              </Label>
              <Col sm={6}>
                <Input
                  type="url"
                  name="url"
                  id="url"
                  placeholder="your personal site url"
                  value={this.state.url}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={3} />
            </FormGroup>
            <FormGroup row>
              <Label for="description" sm={2}>
                Description
              </Label>
              <Col sm={10}>
                <Input
                  type="textarea"
                  name="description"
                  id="description"
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col sm={12}>
                <Interest
                  user={this.props.user}
                  setUser={this.props.setUser}
                  getUser={this.props.getUser}
                  handleInterestSelection={this.handleInterestSelection}
                  interests={this.state.interests}
                />
              </Col>
            </FormGroup>
            <Row>
              <Col xs={12}>
                <hr />
              </Col>
            </Row>
            <Row>
              <Col sm={4} />
              <Col sm={4}>
                <Button color="danger" block onClick={this.handleSubmitRequest}>
                  Submit
                </Button>
              </Col>
              <Col sm={3} />
            </Row>
          </Form>
        </Col>
        <Col sm={1} />
      </Row>
    );
  }
}
