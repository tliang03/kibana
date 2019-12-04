import React, { Component } from 'react';
import PropTypes from 'prop-types';

import UpdateItemModal from './update_item_modal';

const ADD_MODE = 'Add';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: !!(this.props.id)
    };

    this.toggleAddDashboardModal = this.toggleAddDashboardModal.bind(this);
    this.renderModal = this.renderModal.bind(this);
  }

  toggleAddDashboardModal() {
    this.setState({
      showModal: !this.state.showModal
    });
  }

  renderModal() {
    return (
      <div>
        <UpdateItemModal
          id={this.props.id}
          mode={ADD_MODE}
          ranklist={this.props.ranklist}
          onClose={this.toggleAddDashboardModal}
          dashboards={this.props.dashboards}
          searches={this.props.searches}
          visualizations={this.props.visualizations}
          users={this.props.users}
          initialize={this.props.initialize}
          onSave={this.props.onAdd}
        />
      </div>
    );
  }

  render() {

    return (
      <div className="dash_header">

        {this.state.showModal && this.renderModal()}

        <span>Saved Object List</span>
        <button
          type="button"
          className="kuiIcon fa-plus qn_btn_primary"
          onClick={this.toggleAddDashboardModal}
        />
      </div>
    );
  }
}

Header.props = {
  id: PropTypes.string,
  initialize: PropTypes.function,
  dashboards: PropTypes.arrayOf(PropTypes.object),
  searches: PropTypes.arrayOf(PropTypes.object),
  visualizations: PropTypes.arrayOf(PropTypes.object),
  users: PropTypes.arrayOf(PropTypes.object),
  ranklist: PropTypes.arrayOf(PropTypes.object),
  onAdd: PropTypes.function
};
