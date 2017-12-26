import React, { Component } from "react";
import { Row, Col } from "reactstrap";

class DisplayPost extends Component {
  render() {
    return (
      <div>
        <Row className="">
          <div className=" col-lg-3 col-xs-6 col-sm-6 col-md-6">
            <img
              className="img-fluid feedPhoto"
              src={
                this.props.postData.author.imageSource ||
                "../assets/images/profile-icon.png"
              }
              alt="profile"
            />
            <p className="feedColor"> {this.props.postData.author.username}</p>
          </div>
          <div className="feedBody col-lg-9 col-xs-6 col-sm-6 col-md-6">
            {" "}
            {this.props.postData.content}
          </div>
        </Row>
        <Row className="interest">
          <div className="col-sm-6 col-md-6 col-lg-6 location">
            <span className="feedColor">location: </span>
            <br />
            {this.props.postData.location}
          </div>
          <div className="col-sm-2 col-md-4 col-lg-6 location">
            <span className="feedColor">interest: </span>
            {/* to format the list of interests / tags 
              if there is more than one interest separet them with /
            */}
            {this.props.postData.category.map(
              (category, i) =>
                i > 0
                  ? " / " + category.name.toLowerCase()
                  : category.name.toLowerCase()
            )}
          </div>
        </Row>
      </div>
      );
  }
}

export default DisplayPost;