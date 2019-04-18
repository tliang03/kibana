/*
 * Jasmine React Patch for Sticky Header
 */

import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class KuiScrollGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: null
    };

    this.addEvents = this.addEvents.bind(this);
    this.removeEvents = this.removeEvents.bind(this);
    this.handlePaneScroll = this.handlePaneScroll.bind(this);
  }

  componentWillUnmount() {
    const that = this;

    _.each(that.state.groups, (node) => {
      that.removeEvents(node);
    });
  }

  componentDidMount() {
    const that = this;

    this.setState({
      groups: $('[data-scroll-group=\'' + this.props.groupName + '\']').toArray()
    }, () => {
      _.each(that.state.groups, (node) => {
        that.addEvents(node);
      });
    });
  }

  addEvents(node) {
    node.onscroll = this.handlePaneScroll.bind(this, node, this.state.groups);
    node.onmousewheel = this.handlePaneScroll.bind(this, node, this.state.groups);
  }

  removeEvents(node) {
    node.onscroll = null;
    node.onmousewheel = null;
  }

  handlePaneScroll(scrolledNode, groups) {
    const that = this;

    _.each(groups, (node) => {
      that.syncScrollPosition(scrolledNode, node, that.props.scrollMode);
    });
  }

  syncScrollPosition(scrolledNode, node, scrollMode) {
    const {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollLeft,
      scrollWidth,
      clientWidth
    } = scrolledNode;

    const scrollTopOffset = scrollHeight - clientHeight;
    const scrollLeftOffset = scrollWidth - clientWidth;

    if (scrollMode === 'vertical' && scrollTopOffset > 0) {
      node.scrollTop = scrollTop;
    }
    if (scrollMode === 'horizontal' && scrollLeftOffset > 0) {
      node.scrollLeft = scrollLeft;
    }
  }

  render() {
    return (
      <span id="scroll-group" />
    );
  }
}

KuiScrollGroup.propTypes = {
  groupName: PropTypes.string,
  scrollMode: PropTypes.string
};

KuiScrollGroup.defaultProps = {
  scrollMode: 'horizontal'
};
