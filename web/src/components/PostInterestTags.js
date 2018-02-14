import React, { Component, Fragment } from "react";
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
    const OTHER_INTERESTID = "cddf8db1";
    const otherInterest = { interestID: OTHER_INTERESTID, name: "Other" };
    let i = 0;
    return (
      <div id="interest">
        <p> Interest </p>
        {featuredInterest &&
          featuredInterest.map((interest, index) => {
            i++;
            if (interest.interestID !== OTHER_INTERESTID) {
              return (
                <Fragment>
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
                  {i === featuredInterest.length ? (
                    <Button
                      key={otherInterest.interestID}
                      className={
                        this.props.interests.has(otherInterest.interestID)
                          ? "selectedTag btn___interest"
                          : "btn___interest"
                      }
                      onClick={this.handleMultipleSelect}
                      value={otherInterest.interestID}
                      ref={this.props.tagsRef}>
                      {otherInterest.name}
                    </Button>
                  ) : null}
                </Fragment>
              );
            }
          })}
      </div>
    );
  }
}
