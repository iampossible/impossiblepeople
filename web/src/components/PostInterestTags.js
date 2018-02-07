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
  handleMultipleSelect = e => {
    this.props.onClick(e);
  };
  render() {
    const { featuredInterest } = this.state;
    return (
      <FormGroup row>
        <Col sm={2} xs={12}>
          <Label for="interest">Tags</Label>
        </Col>
        <Col sm={9}>
          <Input
            type="select"
            name="postInterestTags"
            id="postInterestTags"
            multiple={true}
            ref={this.props.tagsRef}
            onClick={this.handleMultipleSelect}>
            {featuredInterest.map((interest, index) => {
              return (
                <option
                  key={interest.interestID}
                  value={interest.interestID}
                  className="unSelectedTag">
                  {interest.name}
                </option>
              );
            })}
          </Input>
          <p id="selectInfo">
            <i className="text-info fa fa-info-circle" aria-hidden="true" />&nbsp;&nbsp;
            You can select multiple tags
          </p>
          <hr />
        </Col>
        <Col xs={1} />
      </FormGroup>
    );
  }
}
