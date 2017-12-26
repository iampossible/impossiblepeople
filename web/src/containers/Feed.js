import React, { Component } from "react";
import { Row, Col } from "reactstrap";
import Comment from "../components/Comment";
import Post from "../components/Post";
import DisplayPost from "../components/displayPost"
import DisplayComment from "../components/displayComment"

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
      .then(response => {
        if (response.status === 401) 
          this.props.history.push("/");
        if (response.status > 399)
          return [];
        return response.json()
      })
      .then(response =>
        response.map(post => {
          post.comments = [];
          return post;
        })
      )
      .then(response => {
        this.getComments(response);
        this.setState({
          feed: response,
          loadLastComments: []
        });
      });
  };

  getComments = (posts) => {
    posts.map(post => {
      fetch(`/api/post/${post.postID}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      })
      .then(response => {
        if (response.status > 399)
          return [];
        return response.json()
      })
      .then(response => {
        post.comments.push(...response.comments);
        this.setState(prevState => {
          let feed = prevState.feed.map(prevPost => 
            (prevPost.postID === post.postID) ? (
              post
              ) : (
              prevPost
              )
          )
          return feed;
        });
        return post;
      });    
    })
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
      .then(resp => {
        if (resp.status > 399)
          return [];
        return resp.json();
      })
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
              <DisplayPost postData={feedData} />
              <Comment post={feedData} update={this.upDateComments} />
              <Col>
                <div className="red">
                  {/* here I'm showing comments and the author of the comments  */}

                  {feedData.comments.map((comment, index) => {
                    return (
                      <DisplayComment comment={comment} />
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
