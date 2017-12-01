import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import Comment from "./Comment";
import Post from "./Post";

class Feed extends Component {
  state = {
    feed: [],
    submit: false,
    loadLastComments: []
  };

  componentWillMount() {
    this.getFeeds();
  }
  getFeeds = () => {
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
      .then(response => {
        /* because the current impelementation of the api returns a post as an independent pos
          with each interest/tag. we have to group the interests in the category and remove the duplicated 
          interests   */
        for (let i = 0; i < response.length - 1; i++) {
          for (let j = i + 1; j < response.length; j++) {
            if (response[i] && response[j]) {
              if (response[i].postID === response[j].postID) {
                response[i].category.push(response[j].category[0]);
                delete response[j];
              }
            }
          }
        }
        /* since the delete response[j] command will not make the deleted array entry to have
           'undefined' value we have to filter that out. 
           Array.slice() will not work as it immediately reshuffles the array our condition will fill for 
           consecuative true values as the next one will not be checked as it took the position of the 
           deleted entry
          */
        response = response.filter(response => response !== undefined);
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
          feed: response,
          loadLastComments: []
        });
      });
  };
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
        let comment = resp.comments[resp.comments.length - 1];
        this.setState({
          loadLastComments: this.state.feed
            .filter(p => p.postID === postID)[0]
            .comments.push(comment)
        });
      });
  };

  render() { 
    //getting the user type that is passed from the App redirect
    const { user } = this.props;
    return (
      <div>
        {/* if user is an organisation display the post component at the top */}
        {user && user.userType === "organisation" ? (
          <Post user={user} updateFeeds={this.getFeeds} />
        ) : (
          ""
        )}
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
                <div className="col-sm-2 col-md-4 col-lg-6 location">
                  <span className="feedColor">interest: </span>
                  {/* to format the list of interests / tags 
                    if there is more than one interest separet them with /
                  */}
                  {feedData.category.map(
                    (category, i) =>
                      i > 0
                        ? " / " + category.name.toLowerCase()
                        : category.name.toLowerCase()
                  )}
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
                </div>
              </Col>
            </div>
          );
        })}
      </div>
    );
  }
}
export default Feed;
