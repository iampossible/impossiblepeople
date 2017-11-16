import React, { Component } from "react";
import { Row, Col, InputGroup, Input, Button } from "reactstrap";

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      feed: [],
      submit: false,
      loadCommenets: []
    };
  }
  componentWillMount() {
    let arr= [];
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
        //response is the outcome of the fetch for feed
        
        arr= response.map(x => {
          
          
           fetch(`/api/post/${x.postID}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            credentials: "same-origin"
          })
            .then(resp => resp.json())
            .then(resp => {
             x["comments"] = resp.comments    
             return x;
             
            })
            
          
            
            
        })
        console.log(arr); 
       
        
      })
      
      .catch(err => console.error(err));
      this.setState({
        feed: arr
      },() => console.log(this.state.feed)) 
     
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
    });
  

    // console.log(this.state.input, postID);
  }

  render() {
    console.log(this.state.loadCommenets)
    return this.state.feed.map((feedData, i) => {
      return (
        <div
          key={feedData.postID}
          className="feed"
        >
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
            <div className="feedBody col-lg-9 col-xs-6 col-sm-6 col-md-6"> {feedData.content}</div>
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
          <InputGroup className="comment">
            <Input
              className="input"
              placeholder="write your comment"
              input={this.state.input}
              onChange={this.handleChange}
              //I tried to clear the input after submitting the test but it was unsuccessful
              /* value={this.state.submit ? '' : this.state.input} */
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
              {/* {console.log(Object.keys(feedData))}
              {feedData.comments.map(comment =>{
                console.log(comment)

              return (
                <Row key={comment.commentID}>
                        <div className="feedColor">{comment.author}</div>
                        <div className="feedComment">{comment.content}</div>
                      </Row>
              )
            })
          } */}
                 {/* {this.state.loadCommenets.length>0 ? this.state.loadCommenets.map((comments, index) => {
                   Object.keys(comments).map((key, idx) => {
                     console.log(comments[key])
                    return (
                      <Row key={idx}>
                        <div className="feedColor">{comments[key].author}</div>
                        <div className="feedComment">{comments[key].content}</div>
                      </Row>
                    )

                   })
                  }):""
                } */}
            </div>
          </Col>
        </div>
      );
    });
  }
}
export default Feed;
