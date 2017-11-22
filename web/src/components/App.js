import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import Feed from "./views/Feed";
import Post from "./views/Post";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import { Container } from "reactstrap";
import Header from "./views/Header";

const Main = ({ match }) => {
  return (
    <Switch>
      <Route exact path="/" component={LandingPage} />
      <Route path="/interest" component={Interest} />
      <Route path="/feed" component={Feed} />
      <Route path="/post" component={Post} />
    </Switch>
  );
};
class App extends Component {
  constructor() {
    super();
    this.state = {
      user: {}
    };
  }

  render() {
    return (
      <Container className="App">
        <Header />
        <Main />
      </Container>
    );
  }
}

export default App;
