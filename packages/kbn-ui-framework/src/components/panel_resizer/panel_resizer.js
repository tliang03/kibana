import $ from 'jquery';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class KuiPanelResizer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      onResizing: false,
      $panel: null,
      startWidth: null,
      startX: null
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    this.setState({
      $panel: $(this.props.panelEl),
      startWidth: $(this.props.panelEl).width()
    });
  }

  onMouseDown(evt) {
    this.setState({
      onResizing: true,
      startWidth: this.state.$panel.width(),
      startX: evt.pageX
    });

    $(document.body)
      .on('mousemove', this.onMouseMove)
      .one('mouseup', this.onMouseUp);

  }

  onMouseMove(evt) {
    if(this.state.onResizing) {
      this.state.$panel.width(this.state.startWidth + evt.pageX - this.state.startX);
    }
  }

  onMouseUp(evt) {
    $(evt.currentTarget).off('mousemove', this.onMouseMove);
  }

  render() {
    return (
      <div
        className="kuiPanelResizer"
        onMouseDown={this.onMouseDown}
      >&#xFE19;
      </div>
    );
  }
}

KuiPanelResizer.propTypes = {
  appName: PropTypes.string,
  panelEl: PropTypes.string
};
