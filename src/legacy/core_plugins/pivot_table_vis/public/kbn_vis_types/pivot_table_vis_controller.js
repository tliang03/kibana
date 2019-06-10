
import React, { Component } from 'react';
import { PivotTableVisComponent } from '../components/pivot_table';
import * as UtilLibs from '../lib/util';
import { each } from 'lodash';


export default class PivotTableVisWrapper extends Component {

  constructor(props) {
    super(props);

    const { vis } = props;

    this.state = {
      vis: vis,
      customizedMetric: UtilLibs.findCustomizedMetric(vis.params.customizedMetric),
      perPage: vis.params.perPage,
      rows: [],
      dimensions: [],
      metrics: []
    };
  }

  componentDidMount() {
    this.updateVisData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateVisData(nextProps);
  }

  updateVisData(props) {
    const { vis, visData } = props;
    const tables = visData.tables;

    let colNames = [];
    let rows = [];
    let dimensions = [];
    let metrics = [];

    each(tables, (table) => {
      colNames = UtilLibs.generateDataNames(table.columns);
      rows = UtilLibs.generateRows(colNames, table.rows);
      dimensions = UtilLibs.generateDimensions(colNames);
      metrics = UtilLibs.generateMetrics(colNames);
    });

    this.setState({
      vis: vis,
      customizedMetric: UtilLibs.findCustomizedMetric(vis.params.customizedMetric),
      perPage: vis.params.perPage,
      colNames: colNames,
      rows: rows,
      dimensions: dimensions,
      metrics: metrics
    });

  }

  render() {
    return (
      <div id="pivot-wrapper">
        <PivotTableVisComponent
          metrics={this.state.metrics}
          rows={this.state.rows}
          dimensions={this.state.dimensions}
          activeDimensions={UtilLibs.generateActiveDimensions(this.state.dimensions)}
          nPaginateRows={this.state.perPage}
          customizedMetric={this.state.customizedMetric}
          renderComplete={() => {}}
        />
      </div>
    );
  }
}
