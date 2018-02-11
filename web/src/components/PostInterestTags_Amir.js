import React, { Component } from "react";
import {
  FormGroup,
  Col,
  Label,
  Input,
  Row,
  ListGroupItem,
  ListGroup,
  Button,
  Container
} from "reactstrap";
export class PostInterestTags_Amir extends Component {
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
              className="btn___interest"
              onClick={this.handleMultipleSelect}
              value={interest.interestID}
              ref={this.props.tagsRef}

            >
              {interest.name}
            </Button>
          );
        })}
      </div>
    );
  }
}

export default PostInterestTags_Amir;
