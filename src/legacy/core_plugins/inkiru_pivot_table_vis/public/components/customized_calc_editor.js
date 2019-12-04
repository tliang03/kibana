
import React, { Component } from 'react';
import _ from 'lodash';
import * as UtilLibs from '../lib/util';
import { FormEditor } from './form_editor';

const DEFAULT_PER_PAGE = 15;

class CustomizedMetricEditor extends Component {
  constructor(props) {
    super(props);

    const { editorState, scope, visData } = props;

    this.state = {
      editorState: editorState,
      scope: scope,
      visData: visData,
      customizedMetric: [],
      metricsOptions: [],
      perPage: 15
    };

    this.addMetric = this.addMetric.bind(this);
    this.updateMetric = this.updateMetric.bind(this);
    this.removeMetric = this.removeMetric.bind(this);
    this.updateOptions = this.updateOptions.bind(this);
  }

  componentDidMount() {
    const that = this;

    this.state.scope.$watch(() => {
      return that.state.editorState.aggs.map(agg => {
        return agg.makeLabel();
      }).join();
    }, () => {
      that.setState({
        editorState: that.state.editorState,
        metricsOptions: that.getFieldOptions(that.state.editorState.aggs),
        customizedMetric: that.state.editorState.params.customizedMetric || [],
        perPage: that.state.editorState.params.perPage || DEFAULT_PER_PAGE
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { editorState, scope, visData } = nextProps;

    this.setState({
      editorState: editorState,
      scope: scope,
      visData: visData,
      metricsOptions: this.getFieldOptions(editorState.aggs),
      customizedMetric: editorState.params.customizedMetric || [],
      perPage: editorState.params.perPage || DEFAULT_PER_PAGE
    });
  }

  //function to update Options
  // perPage: param to define rows per page
  updateOptions(value, type) {

    if(type === 'perPage') {
      if(value === '' || value !== '' && value > 0) {

        this.setVisParam(type, parseInt(value));
      }
    }
  }

  //function to add metric
  addMetric() {
    const customizedMetric = _.cloneDeep(this.state.customizedMetric);

    customizedMetric.push(UtilLibs.createDefaultMetrics(customizedMetric, this.state.metricsOptions));

    this.setVisParam('customizedMetric', customizedMetric);
  }

  //function to update metric
  updateMetric(id, obj) {
    let customizedMetric = _.cloneDeep(this.state.customizedMetric);

    customizedMetric = customizedMetric.map((metric) => {
      if(metric.id === id) {
        return obj;
      }
      return metric;
    });

    this.setVisParam('customizedMetric', customizedMetric);
  }

  //function to remove metric
  removeMetric(id) {
    const customizedMetric = this.state.customizedMetric.filter((metric) => {
      return metric.id !== id;
    });

    this.setVisParam('customizedMetric', customizedMetric);
  }

  setVisParam(paramName, paramValue) {
    const params = _.cloneDeep(this.props.editorState.params);
    params[paramName] = paramValue;
    this.props.stageEditorParams(params);
  }

  getFieldOptions(aggs) {
    const options = [];

    _.each(aggs, (agg) => {
      if(agg.enabled && agg.schema.name === 'metric') {
        const opt = {};
        _.extend(opt, agg, { label: agg.makeLabel(), value: agg });
        options.push(opt);
      }
    });

    return options;
  }

  render() {

    const showRemoveEditor = this.state.customizedMetric && this.state.customizedMetric.length > 0;

    return (
      <div className="pivot-editor">
        <div className="kuiSideBarSection">
          <div className="form-group">
            <div className="kuiSideBarFormRow">
              <div
                className="kuiSideBarSectionTitle__text pivottable__label"
                i18n-default-message="Per Page"
              >Per Page
              </div>
              <input
                value={this.state.perPage}
                type="number"
                className="form-control"
                required
                onChange={(evt) => this.updateOptions(evt.currentTarget.value, 'perPage')}
                step="5"
              />
            </div>
          </div>
        </div>
        <div className="kuiSideBarSection">
          <div className="kuiSideBarSectionTitle">
            <div
              className="kuiSideBarSectionTitle__text ng-isolate-scope"
              i18n-default-message="Customized Calculation"
            >Customized Calculation
            </div>
            <button
              aria-label="Add Calculation"
              tooltip="Add Metrics Calculation"
              tooltip-append-to-body="true"
              type="button"
              className="kuiIcon fa-plus kuiSideBarSectionTitle__action"
              onClick={this.addMetric}
            />
          </div>
          {
            this.state.customizedMetric.map((metric) => {

              const id = metric.id;
              const label = metric.label;
              const type = metric.type;
              const fields = metric.fields;
              const digits = metric.digits;

              return (
                <FormEditor
                  showRemoveEditor={showRemoveEditor}
                  id={id}
                  key={label}
                  metric={metric}
                  label={label}
                  type={type}
                  fields={fields}
                  digits={digits}
                  customizedMetric={this.state.customizedMetric}
                  metricsOptions={this.state.metricsOptions}
                  updateMetric={this.updateMetric}
                  removeMetric={this.removeMetric}
                />
              );
            })
          }
        </div>
      </div>
    );
  }
}

CustomizedMetricEditor.propTypes = {};

export default CustomizedMetricEditor;
