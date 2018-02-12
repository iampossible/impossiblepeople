import React, { Component } from "react";
import { Button } from "reactstrap";

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
      <div id="interest">
        <p> Interest </p>
        {featuredInterest.map((interest, index) => {
          return (
            <Button
              key={interest.interestID}
              className={
                this.props.interests.has(interest.interestID)
                  ? "selectedTag btn___interest"
                  : "btn___interest"
              }
              onClick={this.handleMultipleSelect}
              value={interest.interestID}
              ref={this.props.tagsRef}>
              {interest.name}
            </Button>
          );
        })}
      </div>
    );
  }
}
