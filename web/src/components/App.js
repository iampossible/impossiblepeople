import React, { Component } from "react";
import "./App.css";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./views/LandingPage";
import Interest from "./views/Interest";
import "bootstrap/dist/css/bootstrap.css";
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
          <Col className="col-sm-3" />
          <Col className="col-sm-6">
            <Header />
          </Col>
          <Col className="col-sm-3" />
        </Row>
        <Row>
          <Col className="col-sm-1" />
          <Col className="col-sm-10">
            <Main />
          </Col>
          <Col className="col-sm-1" />
        </Row>
      </Container>
    );
  }
}

export default App;
