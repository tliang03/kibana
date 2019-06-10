
import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import {
  htmlIdGenerator,
  EuiComboBox
} from '@elastic/eui';


import AGGREGATOR from '../config/aggregators';
import * as UtilLibs from '../lib/util';

class FormEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.id,
      isValueFormOpen: true,
      label: props.label,
      digits: props.digits || 0,
      metric: props.metric,
      type: props.type,
      fields: props.fields,
      aggLength: props.type ? props.type.min : 1
    };

    this.toggleForm = this.toggleForm.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleLabelChange = this.handleLabelChange.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleAddField = this.handleAddField.bind(this);
    this.handleDeleteField = this.handleDeleteField.bind(this);
    this.handleDigitsChange = this.handleDigitsChange.bind(this);
    this.removeMetric = this.removeMetric.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      label: nextProps.label,
      digits: _.isNumber(nextProps.digits) ? nextProps.digits : 0,
      metric: nextProps.metric,
      type: nextProps.type,
      fields: nextProps.fields,
      aggLength: nextProps.fields.length || (nextProps.type ? nextProps.type.min : 1)
    });
  }

  toggleForm() {
    this.setState({
      isValueFormOpen: !this.state.isValueFormOpen
    });
  }

  removeMetric() {
    this.props.removeMetric(this.state.id);
  }

  handleTypeChange(val) {
    const that = this;
    const stateObj = UtilLibs.createNewMetrics(
      this.state.id,
      this._findAggType(val[0]),
      this.props.customizedMetric,
      this.props.metricsOptions,
      this.state.digits
    );

    this.props.updateMetric(that.state.id, stateObj);
  }

  handleDigitsChange(evt) {
    const digits = evt.currentTarget.value;

    this.props.updateMetric(this.state.id,
      UtilLibs.getUpdatedMetric(
        this.state.id,
        this.state.fields,
        this.state.type,
        this.state.label,
        parseInt(digits)
      ));
  }

  handleLabelChange(evt, changenow) {
    const that = this;
    const label = evt.currentTarget.value;
    let debounce = null;

    this.setState({
      label: label
    });

    if(!changenow) {
      debounce = _.debounce(() => {
        that.props.updateMetric(that.state.id,
          UtilLibs.getUpdatedMetric(
            this.state.id,
            this.state.fields,
            this.state.type,
            this.state.label)
        );
      }, 5000)();
    } else {
      debounce && debounce.cancel();
      that.props.updateMetric(that.state.id,
        UtilLibs.getUpdatedMetric(
          this.state.id,
          this.state.fields,
          this.state.type,
          label,
          this.state.digits)
      );
    }
  }

  handleDeleteField(evt) {
    const that = this;
    const index = $(evt.currentTarget).data('index');

    const fields = _.cloneDeep(this.state.fields);

    fields.splice(index, 1);

    this.props.updateMetric(that.state.id,
      UtilLibs.getUpdatedMetric(
        this.state.id,
        fields,
        this.state.type,
        this.state.label,
        this.state.digits
      ));

  }

  handleAddField() {
    const that = this;
    const fields = _.cloneDeep(this.state.fields);

    if(!this.state.type.max || fields.length < this.state.type.max) {
      fields.push({
        id: this.props.metricsOptions[0].id,
        value: this.props.metricsOptions[0].label,
        label: this.props.metricsOptions[0].label
      });
    }

    this.props.updateMetric(that.state.id,
      UtilLibs.getUpdatedMetric(
        this.state.id,
        fields,
        this.state.type,
        this.state.label,
        this.state.digits
      ));
  }

  handleFieldChange(val, index) {
    const that = this;
    const fields = _.cloneDeep(this.state.fields);

    if(val && val[0] && val[0].value) {
      fields[index] = {
        id: val[0].value.id,
        value: val[0].value.label,
        label: val[0].value.label
      };
    }

    this.props.updateMetric(that.state.id,
      UtilLibs.getUpdatedMetric(
        this.state.id,
        fields,
        this.state.type,
        this.state.label,
        this.state.digits
      ));
  }

  _convertToComboOptions(input, shouldTakeObj) {
    const opts = [];

    if(_.isArray(input)) {
      _.each(input, (opt) => {
        opts.push({
          label: opt.label,
          value: shouldTakeObj ? opt : opt.value
        });
      });
    } else if(input) {
      opts.push({
        label: input.label,
        value: shouldTakeObj ? input : input.value
      });
    }
    return opts;
  }

  _findAggType(val) {
    return AGGREGATOR.find((agg) => {
      return agg.value === val.value;
    });
  }

  render() {
    const htmlId = htmlIdGenerator();

    return (
      <div className="form-group">
        <div className="kuiSideBarCollapsibleTitle">
          <div className="kuiSideBarCollapsibleTitle__label">
            <span
              className={`${this.state.isValueFormOpen ? 'fa-caret-down' : 'fa-caret-right'} kuiIcon kuiSideBarCollapsibleTitle__caret`}
              onClick={this.toggleForm}
            />
            <span className="kuiSideBarCollapsibleTitle__text">{this.state.label}</span>
          </div>
          <button
            className={`${!this.props.showRemoveEditor && 'hidden'} kuiIcon fa-remove kuiSideBarCollapsibleTitle__action`}
            aria-label="Remove Metric"
            onClick={this.removeMetric}
            tooltip="Remove Metric"
            type="button"
          />
        </div>
        <div className={`${!this.state.isValueFormOpen && 'hidden'} kuiSideBarCollapsibleSection`}>
          <div className="kuiSideBarFormRow">
            <label className="pivottable__label" htmlFor={htmlId('type_label')}>Aggregation Type</label>
            <EuiComboBox
              id={htmlId('agg_types')}
              isClearable={false}
              placeholder="Select type..."
              singleSelection={true}
              options={this._convertToComboOptions(AGGREGATOR)}
              selectedOptions={this._convertToComboOptions(this.state.type)}
              onChange={this.handleTypeChange}
            />
          </div>
          <div className="kuiSideBarFormRow">
            <label className="pivottable__label" htmlFor={htmlId('label_label')}>Label</label>
            <input
              name="label"
              className="form-control"
              value={this.state.label}
              onBlur={(evt) => {this.handleLabelChange(evt, true);}}
              onChange={(evt) => {this.handleLabelChange(evt);}}
            />
          </div>
          <div className="kuiSideBarFormRow">
            <label className="pivottable__label" htmlFor={htmlId('digits_label')}>Fix digits</label>
            <input
              value={this.state.digits}
              type="number"
              className="form-control"
              required
              onChange={this.handleDigitsChange}
              step="1"
            />
          </div>
          {
            Array.apply(null, Array(this.state.aggLength)).map((item, index) => {
              return (
                <div key={index}>
                  <div className="kuiSideBarCollapsibleTitle">
                    <label className="pivottable__label" htmlFor={htmlId('metric_label' + index)}>Metric {index}</label>
                    <button
                      className={`
                        ${((this.state.aggLength === index + 1) &&
                        (!this.state.type.max || this.state.type.max > this.state.aggLength)) ? '' : 'hidden'}
                        kuiIcon fa-plus kuiSideBarCollapsibleTitle__action`
                      }
                      aria-label="Add Field"
                      tooltip="Add Field"
                      type="button"
                      data-index={index}
                      onClick={this.handleAddField}
                    />
                    <button
                      className={`
                        ${(this.state.aggLength > this.state.type.min) ? '' : 'hidden'}
                        kuiIcon fa-remove kuiSideBarCollapsibleTitle__action`
                      }
                      data-index={index}
                      aria-label="Remove Field"
                      tooltip="Add Field"
                      type="button"
                      onClick={this.handleDeleteField}
                    />
                  </div>
                  <div className="kuiSideBarFormRow">
                    <EuiComboBox
                      id={htmlId('metrics_' + index)}
                      isClearable={false}
                      placeholder="Select metric..."
                      singleSelection={true}
                      options={this._convertToComboOptions(this.props.metricsOptions, true)}
                      selectedOptions={this._convertToComboOptions(this.state.fields[index], true)}
                      onChange={(val) => {
                        this.handleFieldChange(val, index);
                      }}
                    />
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

FormEditor.propTypes = {
  id: PropTypes.string,
  metric: PropTypes.object,
  label: PropTypes.string,
  digits: PropTypes.number,
  type: PropTypes.object,
  showRemoveEditor: PropTypes.bool,
  customizedMetric: PropTypes.arrayOf(PropTypes.object),
  fields: PropTypes.arrayOf(PropTypes.object),
  metricsOptions: PropTypes.arrayOf(PropTypes.object),
  updateMetric: PropTypes.func.isRequired,
  removeMetric: PropTypes.func.isRequired
};

export { FormEditor };
