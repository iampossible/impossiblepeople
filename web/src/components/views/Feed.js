import React, { Component } from "react";
import { Row, Col, InputGroup, Input, Button } from "reactstrap";
import Post from "./Post";
class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      feed: [],
      submit: false,
      loadComments: []
    };
  }
  componentWillMount() {
    //this will load the feed to the page
    fetch("/api/feed", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    })
      .then(response => response.json())
      .then(response => {
        for (let i = 0; i < response.length - 1; i++) {
          for (let j = i + 1; j < response.length; j++) {
            if (response[i] && response[j]) {
              if (response[i].postID === response[j].postID) {
                response[i].category.push(response[j].category[0]);
                delete response[j];
              }
            } else {
              console.info("oopsies", i, j);
            }
          }
        }
        return response;
      })
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
          feed: response
        });
      });
  }

  handleChange = event => {
    // input is the Comment
    this.setState({ input: event.target.value });
  };

  handleClick(event) {
    //I retriving the postId to write the comment on the database
    let postID = event.target.value;
    this.setState({
      submit: true
    });
    // here we have two fetch :first one  is for writing the comment on the database  and the second one will load the posts to retrive the comments

    //main peoblem here is that the API writen for the app and it is understanable to bind the comment to the post but for website we nieed to show all the comments and posts in the feed page.

    fetch(`/api/post/${postID}/comment`, {
      method: "POST",
      body: JSON.stringify({ content: this.state.input }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    }).then(response => {
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
          this.state.feed
            .filter(p => p.postID === postID)[0]
            .comments.push(resp.comments[resp.comments.length - 1]);
          console.log(this.state.feed.filter(p => p.postID === postID));
        });
    });
  }

  render() {
    //getting the user type that is passed from the landingPage redirect
    const { user } = this.props.location.state;

    return (
      <div>
        {/* if user is an organisation display the post component at the top */}
        {user && user.userType === "organisation" ? <Post user={user} /> : ""}
        {this.state.feed.map((feedData, i) => {
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
                  {" "}
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
                  {feedData.category.map(
                    (category, i) =>
                      i > 0
                        ? category.name.toLowerCase() + " / "
                        : category.name.toLowerCase()
                  )}
                </div>
              </Row>
              <InputGroup className="comment">
                <Input
                  className="input"
                  placeholder="write your comment"
                  input={this.state.input}
                  onChange={this.handleChange}
                  //I tried to clear the input after submitting the test but it was unsuccessful
                />
                <Button
                  className="input-group-addon"
                  onClick={e => {
                    this.handleClick(e);
                  }}
                  value={feedData.postID}
                >
                  Post
                </Button>
              </InputGroup>
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
                </div>
              </Col>
            </div>
          );
        })};
      </div>
    );
  }
}
export default Feed;
