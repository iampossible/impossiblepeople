import React, { Component } from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

class FilterButtons extends Component {
  render() {
    return (
      <Form id="filterPosts">
        <FormGroup>
          <Row id="filterPostsHeading">
            <Col sm={12}>
              <p>Filters</p>
            </Col>
          </Row>
          <Row id="filterPostsAsksOffers">
            <Col sm={4} id="filterPostsAsks">
              <span
                onClick={() => {
                  this.props.updateFilter("ASKS");
                }}
                className={
                  this.props.currentFilter === "ASKS" ? "activeFilter" : ""
                }>
                ASKS
              </span>
            </Col>
            <Col sm={1}>
              <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>
            </Col>
            <Col sm={4} id="filterPostsOffers">
              <span
                onClick={() => {
                  this.props.updateFilter("OFFERS");
                }}
                className={
                  this.props.currentFilter === "OFFERS" ? "activeFilter" : ""
                }>
                OFFERS
              </span>
            </Col>
          </Row>
          <Row id="filterPostsMostRecent">
            <Col sm={12}>
              <span
                onClick={() => {
                  this.props.updateFilter("MOSTRECENT");
                }}
                className={
                  this.props.currentFilter === "MOSTRECENT"
                    ? "activeFilter"
                    : ""
                }>
                RECENT
              </span>
            </Col>
          </Row>
          <Row id="filterPostsByTags">
            <Col sm={12}>
              <ButtonDropdown
                isOpen={this.props.tagsDropdownOpen}
                toggle={this.props.toggleTagsDropdown}>
                <DropdownToggle
                  caret
                  className="btn btn-primary btn-block"
                  disabled={
                    this.props.interests && this.props.interests.length === 0
                  }>
                  Categories
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    onClick={() => {
                      this.props.updateFilter("TAGS", "");
                    }}>
                    Show ALL
                  </DropdownItem>
                  <DropdownItem divider />
                  {//just quick fix just as they don't select their interest on registration
                  this.props.interests
                    ? this.props.interests.map((interest, index) => {
                        return (
                          <DropdownItem
                            key={index}
                            className={
                              this.props.filterTag === interest.interestID
                                ? "activeFilter"
                                : ""
                            }
                            onClick={() => {
                              this.props.updateFilter(
                                "TAGS",
                                interest.interestID
                              );
                            }}>
                            {interest.name}
                          </DropdownItem>
                        );
                      })
                    : ""}
                </DropdownMenu>
              </ButtonDropdown>
            </Col>
          </Row>
        </FormGroup>
      </Form>
    );
  }
}

export default FilterButtons;
