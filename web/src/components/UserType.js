import React, { Component } from "react";
import { Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
export class UserType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: ""
    };
  }

  handleSelection(e) {
    console.log(e.target.value);
  }
  render() {
    return (
      <Form id="selectUserType">
        <FormGroup row>
          <Col sm={{ size: 3 }}>
            <Label>
              <p>I am registering as</p>
            </Label>
          </Col>
          <Col sm={{ size: 3 }}>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  id="volunteer"
                  onClick={this.handleSelection}
                  name="userType"
                  value="volunteer"
                />
                &nbsp;&nbsp; A Volunteer
              </Label>
            </FormGroup>
          </Col>
          <Col sm={{ size: 3 }}>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  id="organisation"
                  onClick={this.handleSelection}
                  name="userType"
                  value="organisation"
                />
                &nbsp;&nbsp;An Organisation
              </Label>
            </FormGroup>
          </Col>
          <Col sm={{ size: 3 }}>
            <Button color="warning">
              &nbsp;&nbsp;&nbsp;Submit&nbsp;&nbsp;&nbsp;
            </Button>
          </Col>
        </FormGroup>
      </Form>
    );
  }
}
