import _ from 'lodash';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  htmlIdGenerator,
  EuiButton,
  EuiButtonEmpty,
  EuiTextArea,
  EuiForm,
  EuiFormRow,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiComboBox
} from '@elastic/eui';

import * as Util from '../lib/util';
import { CustEuiModal } from '../lib/cust_modal/modal';

export default class UpdateItemModal extends Component {
  constructor(props) {
    super(props);

    let dashboard = [];
    let groups = [];
    let members = [];
    let tags = [];
    let notes = '';

    if(this.props.item) {
      dashboard = this.getSelectedSavedObject(props);
      groups = this.getSelectedOption(props.item.groups, Util.getOptionsFromList(props.ranklist, 'groups'));
      members = this.getSelectedOption(props.item.members, Util.getOptionsFromList(props.ranklist, 'members'));
      tags = this.getSelectedOption(props.item.tags, Util.getOptionsFromList(props.ranklist, 'tags'));
      notes = props.item.notes;
    }

    this.state = {
      isDashboardLoading: false,
      dashboard: dashboard,
      groups: groups,
      members: members,
      tags: tags,
      notes: notes,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSelectCreate = this.handleSelectCreate.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hasModalChange = this.hasModalChange.bind(this);
    this.convertToExternalObj = this.convertToExternalObj.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  componentDidMount() {
    if(this.props.dashboards && !this.props.dashboards.length) {
      this.props.initialize().then(() => {
        this.setState({
          isDashboardLoading: false
        });
      });
    }

    this.setState({
      isDashboardLoading: this.props.dashboards && !this.props.dashboards.length
    });
  }

  componentWillReceiveProps(nextProps) {
    let dashboard = [];

    if(nextProps.id) {
      dashboard = this.getSelectedSavedObjectById(nextProps);
    } else if(nextProps.item) {
      dashboard = this.getSelectedSavedObject(nextProps);
    }

    this.setState({
      dashboard: dashboard
    });
  }

  handleSelectChange(value, type) {
    let item = null;

    if(type === 'dashboard') {
      item = this.props.dashboards.find((dash) => value[0].value === dash.value);
      if(item) {
        item = [item];
      } else {
        item = this.props.searches.find((search) => value[0].value === search.value);

        if(item) {
          item = [item];
        } else {
          item = this.props.visualizations.find((vis) => value[0].value === vis.value);

          if(item) {
            item = [item];
          } else {
            item = [];
          }
        }
      }
    } else if(type === 'groups' || type === 'members' || type === 'tags') {
      item = value;
    }

    this.setState({
      [type]: item
    });
  }

  handleSelectCreate(value, type) {
    const items = this.state[type];

    if(type === 'groups') {
      items.push({
        value: value.toUpperCase(),
        label: value.toUpperCase()
      });
    } else if(type === 'members' || type === 'tags') {
      items.push({
        value: Util.strCapitalize(value),
        label: Util.strCapitalize(value)
      });
    }

    this.setState({
      [type]: items
    });
  }

  handleInputChange(evt, type) {
    this.setState({
      [type]: evt.currentTarget.value
    });
  }

  validateAll() {
    if(!this.state.dashboard.length) return false;
    if(!this.state.groups.length) return false;
    if(!this.state.members.length) return false;

    return true;
  }

  convertToString(arr) {
    return arr.reduce((str, item) => {
      if(str !== '') {
        str += ',';
      }

      if(_.isObject(item)) {
        str += item.value;
      } else if(_.isString(item)) {
        str += item;
      }

      return str;
    }, '');
  }

  convertToOptions(arr) {
    return arr.map((obj) => {
      if(_.isObject(obj)) {
        return {
          label: obj.label,
          value: obj.value
        };
      }

    });
  }

  convertToExternalObj(obj) {
    obj = obj || this.state;

    let dashboard = {};

    if(_.isArray(obj.dashboard)) {
      dashboard = obj.dashboard[0];
    } else {
      dashboard = obj;
    }

    return {
      groups: this.convertToString(obj.groups),
      saved_object_id: dashboard.saved_object_id || null,
      saved_object_title: dashboard.saved_object_title || null,
      saved_object_description: dashboard.saved_object_description || null,
      members: this.convertToString(obj.members),
      tags: this.convertToString(obj.tags),
      notes: obj.notes,
      type: dashboard.type
    };

  }

  getSelectedSavedObjectById(props) {
    let selected = [];

    if(props.id) {
      selected = this.getSelectedOptionById(props.id, props.dashboards, 'saved_object_id');
      selected = selected.length ? selected : this.getSelectedOptionById(props.id, props.searches, 'saved_object_id');
      selected = selected.length ? selected : this.getSelectedOptionById(props.id, props.visualizations, 'saved_object_id');
    }

    return selected;
  }

  getSelectedSavedObject(props) {
    let selected = [];

    if(props.item) {
      selected = this.getSelectedOption([props.item.savedObject], props.dashboards, 'saved_object_id');
      selected = selected.length ? selected : this.getSelectedOption([props.item.savedObject], props.searches, 'saved_object_id');
      selected = selected.length ? selected : this.getSelectedOption([props.item.savedObject], props.visualizations, 'saved_object_id');
    }

    return selected;
  }

  getSelectedOptionById(id, options, key) {
    const selected = [];

    if(id) {
      const sel = options.find((opt) => {
        return opt[key] === id;
      });

      if(sel) {
        selected.push(sel);
      }
    }

    return selected;
  }

  getSelectedOption(vals, options, key) {
    const selected = [];
    vals.forEach((val) => {
      const sel = options.find((opt) => {
        if(_.isString(val)) {
          return opt.value === val;
        } else if(key) {
          return opt[key] === val.id;
        } else {
          return opt.value === val.value;
        }

      });

      if(sel) {
        selected.push(sel);
      }
    });

    return selected;
  }

  onSave() {
    if(this.validateAll() && this.hasModalChange()) {
      this.props.onSave(this.convertToExternalObj(), this.props.item && this.props.item.id).then(() => {
        this.props.onClose();
      });
    }
  }

  hasModalChange() {
    return !_.isEqual(this.convertToExternalObj(), this.props.item && this.convertToExternalObj(this.props.item));
  }

  render() {
    const htmlId = htmlIdGenerator();

    const formElement = (
      <EuiForm>
        <EuiFormRow label="Group (Type to create new)">
          <EuiComboBox
            id={htmlId('combo_group')}
            isClearable={false}
            placeholder="Select groups ..."
            options={Util.getOptionsFromList(this.props.ranklist, 'groups')}
            selectedOptions={this.convertToOptions(this.state.groups)}
            onChange={(val) => this.handleSelectChange(val, 'groups')}
            onCreateOption={(val) => this.handleSelectCreate(val, 'groups')}
          />
        </EuiFormRow>
        <EuiFormRow label="Dashboard / Discover / Visualization">
          <EuiComboBox
            id={htmlId('combo_saved_object')}
            isClearable={false}
            placeholder="Select a dashboard or a discover ..."
            singleSelection={true}
            options={[
              {
                label: 'Dashboard',
                options: this.convertToOptions(this.props.dashboards)
              },
              {
                label: 'Discover',
                options: this.convertToOptions(this.props.searches)
              },
              {
                label: 'Visualization',
                options: this.convertToOptions(this.props.visualizations)
              }
            ]}
            selectedOptions={this.convertToOptions(this.state.dashboard)}
            onChange={(val) => this.handleSelectChange(val, 'dashboard')}
          />
        </EuiFormRow>
        <EuiFormRow label="Members">
          <EuiComboBox
            id={htmlId('combo_members')}
            placeholder="Select members ..."
            options={Util.unionBy(this.props.users, Util.getOptionsFromList(this.props.ranklist, 'members'), 'label')}
            selectedOptions={this.convertToOptions(this.state.members)}
            onChange={(val) => this.handleSelectChange(val, 'members')}
            onCreateOption={(val) => this.handleSelectCreate(val, 'members')}
          />
        </EuiFormRow>
        <EuiFormRow label="Tags (Type to create new)">
          <EuiComboBox
            id={htmlId('combo_tags')}
            placeholder="Select tags ..."
            options={Util.getOptionsFromList(this.props.ranklist, 'tags')}
            selectedOptions={this.convertToOptions(this.state.tags)}
            onChange={(val) => this.handleSelectChange(val, 'tags')}
            onCreateOption={(val) => this.handleSelectCreate(val, 'tags')}
          />
        </EuiFormRow>
        <EuiFormRow label="Notes">
          <EuiTextArea
            compressed
            value={this.state.notes}
            onChange={(val) => this.handleInputChange(val, 'notes')}
          />
        </EuiFormRow>
      </EuiForm>
    );

    const modal = (
      <EuiOverlayMask>
        <CustEuiModal onClose={this.props.onClose} className="qn_dashboardmodal">
          <EuiModalHeader>
            <EuiModalHeaderTitle id={htmlId('quicknavi.addDashboardModal.header')}>
              <span>{this.props.mode} Saved Objects</span>
            </EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>{formElement}</EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty onClick={this.props.onClose}>Cancel</EuiButtonEmpty>

            <EuiButton
              onClick={this.onSave}
              fill
              disabled={(!this.validateAll()) || !this.hasModalChange()}
            >
              {this.props.mode}
            </EuiButton>
          </EuiModalFooter>
        </CustEuiModal>
      </EuiOverlayMask>
    );

    return (
      <div>
        {modal}
      </div>
    );
  }
}

UpdateItemModal.props = {
  mode: PropTypes.string,
  onClose: PropTypes.function,
  onSave: PropTypes.function,
  dashboards: PropTypes.arrayOf(PropTypes.object),
  searches: PropTypes.arrayOf(PropTypes.object),
  visualizations: PropTypes.arrayOf(PropTypes.object),
  users: PropTypes.arrayOf(PropTypes.object),
  ranklist: PropTypes.arrayOf(PropTypes.object),
  initialize: PropTypes.function,
  item: PropTypes.object
};
