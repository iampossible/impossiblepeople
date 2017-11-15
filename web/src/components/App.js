import React, { Component } from "react";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import Feed from "./views/Feed";
import Post from "./views/Post";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";

import { Container, Row, Col } from "reactstrap";

const Header = () => {
  return (
    <header className="App-header">
      <h1>We Are One</h1>
    </header>
  );
};
const Main = ({ match }) => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/interest" component={Interest} />
        <Route path="/feed" component={Feed} />
        <Route path="/post" component={Post} />
      </Switch>
    </Router>
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
        <Row>
          <Col className="col-sm-12 col-md-12">
            <Header />
          </Col>
        </Row>

        <Main />
      </Container>
    );
  }
}

export default App;
