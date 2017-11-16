import React, { Component } from "react";
import { FormGroup, Col, Label, Input } from "reactstrap";
export class PostInterestTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredInterest: []
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillMount() {
    //load all the featured interests from the DB
    fetch(`/api/interest`, {
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(response => {
        this.setState({
          featuredInterest: response
        });
      });
  }
  handleChange = e => {
    this.props.onChange(e);
  };
  render() {
    const { featuredInterest } = this.state;
    return (
      <FormGroup row>
        <Label for="interest" sm={{ size: 2 }}>
          Tags
        </Label>
        <Col sm={{ size: 5 }}>
          <Input
            type="select"
            name="interestID"
            id="interestID"
            multiple={true}
            onChange={this.handleChange}
            className="inputBG"
          >
            {featuredInterest.map((interest, index) => {
              return (
                <option key={index} value={interest.interestID}>
                  {interest.name}
                </option>
              );
            })}
          </Input>
        </Col>
      </FormGroup>
    );
  }
}
