import React, { Component } from "react";
import { Row, Col} from "reactstrap";
import Comment from "./Comment.js";

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: props.input,
      feed: [],
      submit: false,
      loadLastComments: []
    };
  }
  componentWillMount() {
    //this will load the feed to the page and then will load all the comments for each post
    fetch("/api/feed", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(async response => {
        //response is the outcome of the fetch for feed
        //then I will get the comments from the another fetch
        await Promise.all(
          response.map(async post => {
            post.comments = [];

            let resp = await fetch(`/api/post/${post.postID}`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              credentials: "same-origin"
            });
            resp = await resp.json();
            post.comments.push(...resp.comments);
            return post;
          })
        );
        this.setState({
          feed: response,
          loadLastComments: []
        });
      });
  }
  upDateComments = postID => {
    fetch(`/api/post/${postID}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(resp => resp.json())
      .then(resp => {
        let lastCommnet = this.state.feed
          .filter(p => p.postID === postID)[0]
          .comments.push(resp.comments[resp.comments.length - 1]);
        this.setState({
          loadLastComments: lastCommnet
        });
      });
  };

  render() {
    return this.state.feed.map((feedData, i) => {
      return (
        <div key={feedData.postID} className="feed">
          <Row className="">
            <div className=" col-lg-3 col-xs-6 col-sm-6 col-md-6">
              <img
                className="img-fluid feedPhoto"
                src={
                  feedData.author.imageSource ||
                  "../assets/images/profile-icon.png"
                }
                alt="profile"
              />
              <p className="feedColor"> {feedData.author.username}</p>
            </div>
            <div className="feedBody col-lg-9 col-xs-6 col-sm-6 col-md-6">
              {feedData.content}
            </div>
          </Row>
          <Row className="interest">
            <div className="col-sm-6 col-md-6 col-lg-6 location">
              <span className="feedColor">location: </span>
              <br />
              {feedData.location}
            </div>
            <div className="col-sm-6 col-md-4 col-lg-3 location">
              <span className="feedColor">interest: </span>
              <br />
              {feedData.category.name}
            </div>
          </Row>
          <Comment post={feedData} update={this.upDateComments} />
          <Col>
            <div className="red">
              {/* here I'm showing comments and the author of the comments  */}

              {feedData.comments.map((comment, index) => {
                return (
                  <Row key={index}>
                    <div className="feedColor">{comment.author}</div>
                    <div className="feedComment">{comment.content}</div>
                  </Row>
                );
              })}
              {/* this ROW is a last comment loaded in the page */}
              <Row>
                <div className="feedColor">
                  {this.state.loadLastComments.author}
                </div>
                <div className="feedComment">
                  {this.state.loadLastComments.content}
                </div>
              </Row>
            </div>
          </Col>
        </div>
      );
    });
  }
}
export default Feed;
