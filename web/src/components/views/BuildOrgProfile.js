import React, { Component } from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  FormText,
  Button,
  Label,
  Input
} from "reactstrap";
import Interest from "./Interest";
import defaultProfileImage from "../../assets/images/profile.png";
import { RingLoader } from "react-spinners";

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
export default class BuildOrgProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      orgDescription: "",
      orgUrl: "",
      orgImage: defaultProfileImage,
      interest: []
    };
  }

  handleImageSelection = e => {
    e.persist();

    const files = e.target.files;
    const reader = new FileReader();
    const x = getBase64(files[0]).then(res => {
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
          console.log(this.props.user);
          this.setState({
            orgImage: response.imageSource
          });
        })
        .catch(err => console.log(err));
    });
  };
  isPageReady = () => {
    return this.props.user.imageSource;
  };

  render() {
    if (!this.isPageReady()) {
      return (
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
      );
    }
    return (
      <Row id="profile">
        <Col sm={1} />
        <Col sm={10}>
          <Form>
            <FormGroup row id="profilePictureContainer">
              <Label for="exampleFile" sm={2} id="profilePictureLabel">
                Profile Picture
              </Label>
              <Col sm={10}>
                <Row>
                  <Col sm={5}>
                    <img
                      id="preview"
                      src={
                        this.props.user.imageSource
                          ? this.props.user.imageSource
                          : this.state.orgImage
                      }
                    />
                  </Col>
                  <Col sm={7} id="profilePictureInfo">
                    <FormText color="muted">
                      If you don&apos;t upload your organisations profile
                      picture the one displayed above will be used by default
                    </FormText>
                  </Col>
                </Row>
                <Row id="uploadButton">
                  <Col>
                    <Input
                      type="file"
                      name="orgProfileImage"
                      id="orgProfileImage"
                      accept=".jpg, .jpeg, .png"
                      onChange={this.handleImageSelection}
                    />
                  </Col>
                </Row>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label for="name" sm={2}>
                Name
              </Label>
              <Col sm={6}>
                <Input
                  type="text"
                  name="name"
                  id="orgName"
                  defaultValue={this.props.user.organisationName}
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
                  id="orgUrl"
                  placeholder="your organisation url"
                />
              </Col>
              <Col sm={3} />
            </FormGroup>
            <FormGroup row>
              <Label for="description" sm={2}>
                Description
              </Label>
              <Col sm={10}>
                <Input type="textarea" name="description" id="orgDescription" />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col sm={12}>
                <Interest
                  user={this.props.user}
                  setUser={this.props.setUser}
                  getUser={this.props.getUser}
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
                <Button color="danger" block>
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
