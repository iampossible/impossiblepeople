import React, { Component } from "react";
import { Row, Col, Button, Tooltip } from "reactstrap";
import { RingLoader } from "react-spinners";
import "bootstrap/dist/css/bootstrap.css";
import * as moment from "moment";
import Comment from "../components/Comment";
import Post from "../components/Post";
import DisplayPost from "../components/displayPost"
import DisplayComment from "../components/displayComment"

class Feed extends Component {
  state = {
    feed: [],
    loading: true,
    loadLastComments: [],
    postToUpdate: ""
  };

  componentWillMount() {
    this.getFeeds();
  }



  getFeeds = () => {
    this.setState({
      postToUpdate: ""
    });
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
        if (response.status === 401) this.props.history.push("/");
        if (response.status > 399) return [];
        return response.json();
      })
      .then(response =>
        response.map(post => {
          post.comments = [];
          return post;
        })
      )
      .then(response => {
        this.setState({
          feed: response,
          loadLastComments: [],
          loading: false
        });
      });
  };

  handlePostUpdate = postID => {
    let postToUpdate = this.state.feed.filter(
      feedData => feedData.postID === postID
    );
    this.setState({ postToUpdate });
  };

  handlePostDelete = postID => {
    if (window.confirm("Do you really want to delete this post ?")) {
      fetch(`/api/post/${postID}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        credentials: "same-origin"
      })
        .then(resp => {
          if (resp.status > 399) return [];
          return resp.json();
        })
        .then(resp => {
          if (resp !== []) {
            this.getFeeds();
          }
        });
    }
  };

  render() {
    //getting the user type that is passed from the App redirect
    const { user } = this.props;
    return this.state.loading ? (
      <Row id="feedRingLoader">
        <Col xs={4} />
        <Col xs={4}>
          <div className="RingLoader center-loading">
            <RingLoader
              color="#123abc"
              loading={this.state.loading}
              size={100} /*the size of the spinner*/
            />
          </div>
        </Col>
        <Col xs={4} />
      </Row>
    ) : (
      <div>
        {/* if user is an organisation display the post component at the top */}
        {user && user.userType === "organisation" ? (
          <Post
            user={user}
            updateFeeds={this.getFeeds}
            postToUpdate={this.state.postToUpdate}
          />
        ) : (
          ""
        )}
        {this.state.feed.length > 0 ? (
          this.state.feed.map((feedData, i) => {
            return (
              <div key={feedData.postID} className="feed">
                <Row xs={12}>
                  <DisplayPost postData={feedData} user={user} handlePostUpdate={this.handlePostUpdate} handlePostDelete={this.handlePostDelete} />
                  <Row id="comments">
                    <Col xs={12}>
                      <Comment postID={feedData.postID} user={user} />
                    </Col>
                  </Row>
                </Row>
              </div>
            );
          })
        ) : (
          <div id="noFeedMessageContainer">
            <Row>
              <Col xs={1} />
              <Col xs={10} id="noFeedMessage">
                <p>
                  <i className="fa fa-lg fa-info-circle" aria-hidden="true" />&nbsp;&nbsp;
                  <span>
                    Sorry, There is no feed to display, at the moment, which is
                    related to the interest areas that you have subscribed for.
                  </span>
                </p>
              </Col>
              <Col xs={1} />
            </Row>
          </div>
        )}
      </div>
    );
  }
}
export default Feed;
