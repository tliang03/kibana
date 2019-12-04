
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import * as actions from '../actions';

import Header from './header';
import RankList from './ranklist';
import { NoResults } from './no_results';
import ErrorContainer from './errors';

const mapStateToProps = (state) => {
  const { dashboards, searches, visualizations, ranklist, roles, sections, users, error } = state;
  return {
    dashboards: dashboards,
    searches: searches,
    visualizations: visualizations,
    ranklist: ranklist,
    roles: roles,
    users: users,
    sections: sections,
    error: error
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    _addItem: (itemObj) => {
      return dispatch(actions.addItem(itemObj));
    },
    _deleteItem: (itemObj) => {
      return dispatch(actions.deleteItem(itemObj));
    },
    _editItem: (itemObj, id) => {
      return dispatch(actions.editItem(itemObj, id));
    },
    _searchAllList: () => {
      return dispatch(actions.searchAllList());
    },
    _searchAllDashboards: () => {
      return dispatch(actions.searchAllDashboards());
    },
    _searchAllSearch: () => {
      return dispatch(actions.searchAllSearch());
    },
    _searchAllVisualization: () => {
      return dispatch(actions.searchAllVisualization());
    },
    _searchAllUsers: () => {
      return dispatch(actions.searchAllUsers());
    }
  };
};

class DashboardRank extends Component {
  constructor(props) {
    super(props);

    this.initializeList = this.initializeList.bind(this);
    this.initializePopup = this.initializePopup.bind(this);

    this.deleteItem = this.deleteItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  componentDidMount() {
    this.initializeList();
  }

  initializeList() {
    this.props._searchAllList();
  }

  initializePopup() {
    const promises = [
      this.props._searchAllDashboards(),
      this.props._searchAllSearch(),
      this.props._searchAllVisualization(),
      this.props._searchAllUsers()
    ];
    return Promise.all(promises);
  }

  addItem(item) {
    return this.props._addItem(item);
  }

  deleteItem(item) {
    return this.props._deleteItem(item);
  }

  editItem(item, id) {
    return this.props._editItem(item, id);
  }

  render() {
    return (
      <div className="dashRank" id="dashMain">
        <Header
          id={this.props.id}
          initialize={this.initializePopup}
          searches={this.props.searches}
          visualizations={this.props.visualizations}
          dashboards={this.props.dashboards}
          users={this.props.users}
          ranklist={this.props.ranklist}
          onAdd={this.addItem}
        />
        {
          this.props.error &&
          <ErrorContainer
            error={this.props.error}
          />
        }
        <div className="dashContent">
          {
            !!(Object.keys(this.props.ranklist).length) &&
            <RankList
              initialize={this.initializePopup}
              dashboards={this.props.dashboards}
              searches={this.props.searches}
              visualizations={this.props.visualizations}
              users={this.props.users}
              ranklist={this.props.ranklist}
              editItem={this.editItem}
              deleteItem={this.deleteItem}
            />
          }
          {
            !(Object.keys(this.props.ranklist).length) &&
            <NoResults />
          }
        </div>

      </div>

    );
  }
}

DashboardRank.propTypes = {
  id: PropTypes.string
};

DashboardRank.defaultProps = {
  id: null
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardRank);
