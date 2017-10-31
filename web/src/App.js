import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import FacebookLogin from "react-facebook-login";

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: {}
    };
  }
  responseFacebook = response => {
    return fetch(`/api/facebook/check?token=${response.accessToken}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(response => {
        console.log(response);
        this.setState({
          user: response
        });
      });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">We Are One</h1>
        </header>
        <p className="App-intro">
          <FacebookLogin
            appId="133088487346292"
            autoLoad={true}
            fields="name,email,picture"
            callback={this.responseFacebook}
          />
        </p>
        <p>{this.state.user.firstName}</p>
        <p>{this.state.user.lastName}</p>
        <p>{this.state.user.email}</p>
        <img src={this.state.user.imageSource} alt="" />
      </div>
    );
  }
}

export default App;
