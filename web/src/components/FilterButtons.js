import React, { Component } from "react";
import { Row, Col, Form, FormGroup, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import "bootstrap/dist/css/bootstrap.css";

class FilterButtons extends Component {

  render() {
    return (
      <div className="filterButtons">
        <Form id="filterButtons">
          <FormGroup row>
            <Col sm={3} />
            <Col sm={9} xs={12} className="filterPosts">
              <Button
                onClick={() => {
                  this.props.updateFilter("MOSTRECENT");
                }}
                tag="MOSTRECENT"
                disabled={this.props.currentFilter === "MOSTRECENT"}
              >
                &nbsp; &nbsp; &nbsp;
                Most Recent &nbsp; &nbsp;
                &nbsp;
              </Button>
              &nbsp; &nbsp;
              <Button
                onClick={() => {
                  this.props.updateFilter("ASKS");
                }}
                tag="ASKS"
                disabled={this.props.currentFilter === "ASKS"}
              >
                &nbsp; &nbsp; &nbsp;
                ASKS &nbsp; &nbsp;
                &nbsp;
              </Button>
              &nbsp; &nbsp;
              <Button
                onClick={() => {
                  this.props.updateFilter("OFFERS");
                }}
                tag="OFFERS"
                disabled={this.props.currentFilter === "OFFERS"}
              >
                &nbsp; &nbsp; &nbsp;
                OFFERS &nbsp; &nbsp;
                &nbsp;
              </Button>
              &nbsp; &nbsp;
              <ButtonDropdown 
                isOpen={this.props.tagsDropdownOpen} 
                toggle={this.props.toggleTagesDropdown} 
              >
                <DropdownToggle caret>
                  Post Tags
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem 
                    disabled={this.props.filterTag === ""}
                    onClick={() => {
                      this.props.updateFilter("TAGS", "");
                    }}
                  >
                    SHOW ALL
                  </DropdownItem>
                  {this.props.interests.map(interest => {
                    return (
                      <DropdownItem 
                        disabled={this.props.filterTag === interest.interestID}
                        onClick={() => {
                          this.props.updateFilter("TAGS", interest.interestID);
                        }}
                      >
                        {interest.name}
                      </DropdownItem>
                    );
                  })
                  }
                </DropdownMenu>
              </ButtonDropdown>
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  }
}

export default FilterButtons;
