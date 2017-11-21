import React, { Component } from "react";
import { InputGroup, Input, Button } from "reactstrap";

class Comment extends Component {
  state = {
    input: "",
    submit: false
  };

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
    // here we have two fetch :first one  is for writing the comment on the database  and the second one will load the posts to retrive the  last comments

    fetch(`/api/post/${postID}/comment`, {
      method: "POST",
      body: JSON.stringify({ content: this.state.input }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin"
    }).then(() => {
      this.props.update(postID);
      this.setState({
        input: ""
      });
    });
  }

  render() {
    return (
      <InputGroup className="comment">
        <Input
          className="input"
          placeholder="write your comment"
          input={this.state.input}
          onChange={this.handleChange}
          value={this.state.input}
          //The value will clear the input area when the post will submit
        />
        <Button
          className="input-group-addon"
          onClick={e => {
            this.handleClick(e);
          }}
          value={this.props.post.postID}
        >
          Post
        </Button>
      </InputGroup>
    );
  }
}

export default Comment;
