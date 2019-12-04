import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  EuiBadge,
  EuiInMemoryTable,
  EuiLink,
  EuiFormLabel
} from '@elastic/eui';

import * as Util from '../lib/util';

import UpdateItemModal from './update_item_modal';

const UPDATE_MODE = 'Update';
const TYPE_OPTIONS = [
  {
    value: 'dashboard',
    label: 'Dashboard'
  },
  {
    value: 'discover',
    label: 'Discover'
  },
  {
    value: 'visualize',
    label: 'Visualization'
  }
];

export default class RankList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: {},
      currentItem: null
    };

    this.deleteItem = this.deleteItem.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  componentDidMount() {
    const tagOpts = Util.getTagsOptions(this.props.ranklist);
    const tags = {};

    tagOpts.forEach((tag) => {
      tags[tag.label] = tag.color;
    });

    this.setState({
      tags: tags
    });
  }

  componentWillReceiveProps(nextProps) {
    const tagOpts = Util.getTagsOptions(nextProps.ranklist);
    const tags = {};

    tagOpts.forEach((tag) => {
      tags[tag.label] = tag.color;
    });

    this.setState({
      tags: tags
    });
  }

  deleteItem(item) {
    this.props.deleteItem(item);
  }

  getTagColor(tag) {
    return this.state.tags[tag];
  }

  toggleModal(item) {
    this.setState({
      showModal: !this.state.showModal,
      currentItem: item
    });
  }

  convertToModalItem() {
    return this.state.currentItem;
  }

  renderModal() {
    return (
      <UpdateItemModal
        mode={UPDATE_MODE}
        ranklist={this.props.ranklist}
        onClose={this.toggleModal}
        dashboards={this.props.dashboards}
        searches={this.props.searches}
        visualizations={this.props.visualizations}
        users={this.props.users}
        initialize={this.props.initialize}
        item={this.state.currentItem}
        onSave={this.props.editItem}
      />
    );
  }

  render() {
    const actions = [
      {
        name: 'Edit',
        isPrimary: true,
        description: 'Edit this user',
        icon: 'pencil',
        type: 'icon',
        onClick: this.toggleModal,
      },
      {
        name: 'Delete',
        description: 'Delete this user',
        icon: 'trash',
        color: 'danger',
        type: 'icon',
        onClick: this.deleteItem,
        isPrimary: true,
      }
    ];

    const columns = [
      {
        field: 'groups_str',
        name: 'Groups',
        sortable: true
      },
      {
        field: 'type',
        name: 'Type',
        sortable: true,
        render: type => (
          <span>{Util.strCapitalize(type)}</span>
        ),
      },
      {
        field: 'savedObject',
        name: 'Title',
        render: savedObject => (
          <EuiLink href={`${savedObject.link}`} target="_blank">
            {savedObject.title}
          </EuiLink>
        ),
        sortable: true
      },
      {
        field: 'savedObject',
        name: 'Description',
        render: savedObject => (
          <EuiFormLabel>
            {savedObject.description}
          </EuiFormLabel>
        ),
        sortable: true
      },
      {
        field: 'members_str',
        name: 'Members',
        sortable: true
      },
      {
        field: 'tags_str',
        name: 'Tags',
        render: (tagStr) => {
          const that = this;
          const tags = tagStr.split(',');
          return (
            <div>
              {
                tags.map((tag) => {
                  return (
                    <EuiBadge key={tag} color={that.getTagColor(tag)}>
                      {tag}
                    </EuiBadge>
                  );
                })
              }
            </div>
          );
        },
        sortable: true
      },
      {
        field: 'notes',
        name: 'Notes',
        sortable: true
      },
      {
        name: 'Actions',
        actions,
      }
    ];

    const search = {
      box: {
        schema: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'type',
          name: 'Type',
          multiSelect: false,
          options: TYPE_OPTIONS,
        },
        {
          type: 'field_value_selection',
          field: 'groups',
          name: 'Group',
          multiSelect: 'or',
          options: Util.getOptionsFromList(this.props.ranklist, 'groups').map(item => ({
            value: item.value,
            name: item.label
          })),
        },
        {
          type: 'field_value_selection',
          field: 'members',
          name: 'Members',
          multiSelect: 'or',
          options: Util.getOptionsFromList(this.props.ranklist, 'members').map(item => ({
            value: item.value,
            name: item.label
          }))
        },
        {
          type: 'field_value_selection',
          field: 'tags',
          name: 'Tag',
          multiSelect: 'or',
          options: Util.getTagsOptions(this.props.ranklist).map(item => ({
            value: item.value,
            name: item.label
          }))
        }
      ]
    };

    return (
      <Fragment>
        <EuiInMemoryTable
          items={this.props.ranklist}
          columns={columns}
          search={search}
          pagination={true}
          sorting={true}
        />
        {this.state.showModal && this.renderModal()}
      </Fragment>
    );
  }
}

RankList.props = {
  initialize: PropTypes.function,
  dashboards: PropTypes.arrayOf(PropTypes.object),
  searches: PropTypes.arrayOf(PropTypes.object),
  visualizations: PropTypes.arrayOf(PropTypes.object),
  ranklist: PropTypes.arrayOf(PropTypes.object),
  users: PropTypes.arrayOf(PropTypes.object),
  deleteItem: PropTypes.function,
  editItem: PropTypes.function
};
