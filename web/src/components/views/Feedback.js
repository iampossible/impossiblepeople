import React, { Component } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert
} from "reactstrap";
import { handleErrors } from "../../utillity/helpers";

export default class Feedback extends Component {
  state = {
    fullName: "",
    email: "",
    subject: "",
    body: "",
    error: [],
    successMessage: null
  };

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;

    this.setState({
      [name]: value
    });
  };
  handleSubmit = e => {
    let error = [];
    if (this.state.fullName === "") {
      error.push("You need to put your full name");
    }
    if (this.state.email === "") {
      error.push("You need to put your email address");
    } else {
      // regular expression to validate if the email address is in a valid format
      let emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //verify the email address and notify success or error
      if (!emailRegExp.test(this.state.email)) {
        error.push("The email address " + this.state.email + " is not valid");
      }
    }
    if (this.state.subject === "") {
      error.push("You need to put the subject of your feedback");
    }
    if (this.state.body === "") {
      error.push("You need to write your feedback");
    }

    if (error.length > 0) {
      this.setState(
        {
          error
        },
        () => {
          //clear the error message
          setTimeout(() => {
            this.setState({
              error: []
            });
          }, 5000);
        }
      );
    } else {
      const { error, successMessage, ...feedback } = this.state;

      fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify(feedback)
      })
        .then(handleErrors)
        .then(response => response.json())
        .then(response => {
          if (response) {
            this.setState(
              {
                fullName: "",
                email: "",
                subject: "",
                body: "",
                successMessage:
                  "Thank you very much for your Feedback, we appreciate that"
              },
              () => {
                //clear the error message
                setTimeout(() => {
                  this.setState({
                    successMessage: null
                  });
                }, 5000);
              }
            );
          }
        })
        .catch(err => {
          this.setState(
            {
              error: [
                "oops: Something happend your feedback can't be sent at the moment"
              ]
            },
            () => {
              //clear the error message
              setTimeout(() => {
                this.setState({
                  error: []
                });
              }, 5000);
            }
          );
        });
    }
  };
  render() {
    return (
      <Row className="footerLinks">
        <Col sm={12}>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h4>
                <u>FEEDBACK</u>
              </h4>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <h5>Any issues or questions ?</h5>
            </Col>
            <Col sm={1} />
          </Row>
          <Row>
            <Col sm={1} />
            <Col sm={10}>
              <p>
                Humankind is a work in progress . We welcome your feedback. If
                you are having technical issues, or you have a suggestion to
                improve the product , please contact us <strong>
                  hello@weareonecollective.org
                </strong>
              </p>
            </Col>
            <Col sm={1} />
          </Row>
          <Form>
            <FormGroup row>
              <Col sm={1} />
              <Label for="fullName" sm={2}>
                Full Name
              </Label>
              <Col sm={8}>
                <Input
                  type="text"
                  name="fullName"
                  id="feedbackMessageFullName"
                  placeholder="Your full Name"
                  onChange={this.handleChange}
                  value={this.state.fullName}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Label for="email" sm={2}>
                Email
              </Label>
              <Col sm={8}>
                <Input
                  type="email"
                  name="email"
                  id="feedbackMessageEmail"
                  placeholder="your email as you@someprovider.com"
                  onChange={this.handleChange}
                  value={this.state.email}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={1} />
              <Label for="subject" sm={2}>
                Subject
              </Label>
              <Col sm={8}>
                <Input
                  type="text"
                  name="subject"
                  id="feedbackMessageSubject"
                  placeholder="your subject"
                  value={this.state.subject}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>

            <FormGroup row>
              <Col sm={1} />
              <Label for="boby" sm={2}>
                Feedback
              </Label>
              <Col sm={8}>
                <Input
                  type="textarea"
                  name="body"
                  id="feedbackMessagebody"
                  value={this.state.body}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={1} />
            </FormGroup>
            <FormGroup row>
              <Col sm={3} />
              <Col sm={8}>
                <Button
                  id="feedbackMessageSendButton"
                  onClick={this.handleSubmit}>
                  Send
                </Button>
              </Col>
              <Col sm={1} />
            </FormGroup>
            {this.state.error.length > 0 ? (
              <Row>
                <Col sm={3} />
                <Col sm={8} className="feedbackError">
                  <Alert color="danger">
                    {this.state.error.map((error, i) => (
                      <p key={i}>&ndash;{error}</p>
                    ))}
                  </Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
            {this.state.successMessage ? (
              <Row>
                <Col sm={3} />
                <Col sm={8} className="feedbackSuccess">
                  <Alert color="success">
                    <p>&ndash;&nbsp;&nbsp;{this.state.successMessage}</p>
                  </Alert>
                </Col>
                <Col sm={1} />
              </Row>
            ) : (
              ""
            )}
          </Form>
        </Col>
      </Row>
    );
  }
}
