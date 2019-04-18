/*
 * Jasmine React Patch for Sticky Header
 */

import $ from 'jquery';
import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { KuiScrollGroup } from './scroll_group';

export class KuiStickyHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      headerVisible: false
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.isSortableColumn = this.isSortableColumn.bind(this);
    this.tooltip = this.tooltip.bind(this);
    this.canMoveColumnLeft = this.canMoveColumnLeft.bind(this);
    this.canMoveColumnRight = this.canMoveColumnRight.bind(this);
    this.canRemoveColumn = this.canRemoveColumn.bind(this);
    this.headerClass = this.headerClass.bind(this);
    this.moveColumnLeft = this.moveColumnLeft.bind(this);
    this.moveColumnRight = this.moveColumnRight.bind(this);
    this.removeColumn = this.removeColumn.bind(this);
    this.cycleSortOrder = this.cycleSortOrder.bind(this);
    this.getAriaLabelForColumn = this.getAriaLabelForColumn.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll() {
    const wTop = $(window).scrollTop();
    const elTop = $(this.props.headerEl).offset().top;

    this.setState({
      headerVisible: !!(wTop >= elTop)
    });
  }

  isSortableColumn(columnName) {
    return !!this.props.indexPattern
      && _.isFunction(this.props.onChangeSortOrder)
      && _.get(this.props, ['indexPattern', 'fields', 'byName', columnName, 'sortable'], false);
  }

  tooltip(column) {
    if (!this.isSortableColumn(column)) return '';
    return 'Sort by ' + column;
  }

  canMoveColumnLeft(columnName) {
    return _.isFunction(this.props.onMoveColumn) && this.props.columns.indexOf(columnName) > 0;
  }

  canMoveColumnRight(columnName) {
    return _.isFunction(this.props.onMoveColumn)
      && this.props.columns.indexOf(columnName) < this.props.columns.length - 1;
  }

  canRemoveColumn(columnName) {
    return _.isFunction(this.props.onRemoveColumn)
      && (columnName !== '_source' || this.props.columns.length > 1);
  }

  headerClass(column) {
    if (!this.isSortableColumn(column)) return;

    const sortOrder = this.props.sortOrder;
    const defaultClass = ['fa', 'fa-sort-up', 'kbnDocTableHeader__sortChange'];

    if (!sortOrder || column !== sortOrder[0]) return defaultClass;
    return ['fa', sortOrder[1] === 'asc' ? 'fa-sort-up' : 'fa-sort-down'];
  }

  moveColumnLeft(columnName) {
    const newIndex = this.props.columns.indexOf(columnName) - 1;

    if (newIndex < 0) {
      return;
    }

    this.props.onMoveColumn(columnName, newIndex);
  }

  moveColumnRight(columnName) {
    const newIndex = this.props.columns.indexOf(columnName) + 1;

    if (newIndex >= this.props.columns.length) {
      return;
    }

    this.props.onMoveColumn(columnName, newIndex);
  }

  removeColumn(columnName) {
    this.props.onRemoveColumn && this.props.onRemoveColumn(columnName);
  }

  cycleSortOrder(columnName) {
    if (!this.isSortableColumn(columnName)) {
      return;
    }

    const [currentColumnName, currentDirection = 'asc'] = this.props.sortOrder;
    const newDirection = (columnName === currentColumnName && currentDirection === 'asc') ? 'desc' : 'asc';

    this.props.onChangeSortOrder(columnName, newDirection);
  }

  getAriaLabelForColumn(name) {
    if (!this.isSortableColumn(name)) return null;

    const [currentColumnName, currentDirection = 'asc'] = this.props.sortOrder;

    if(name === currentColumnName && currentDirection === 'asc') {
      return `Sort ${name} descending`;
    }

    return `Sort ${name} ascending`;
  }

  getHeaderWidth(columnName) {
    return $('.kbn-table').find('th[data-name="' + columnName + '"]').outerWidth();
  }

  render() {
    const indexPattern = this.props.indexPattern;
    const timeCls = classNames(this.headerClass(indexPattern.timeFieldName));
    const containerStyle = {
      width: $('.kbnDocTable__container').outerWidth() + 'px'
    };
    const tableStyle = {
      width: $('.kbn-table').outerWidth() + 'px'
    };

    return (
      <div
        className={`${this.state.headerVisible && 'visible'} kuiStickyHeader`}
        style={containerStyle}
        data-scroll-group={this.props.groupName}
      >
        <KuiScrollGroup
          groupName={this.props.groupName}
          scrollMode="horizontal"
        />
        <table className="kuiStickyHeader__table table" style={tableStyle}>
          <thead>
            <tr>
              <th
                width={this.getHeaderWidth('Expander')}
              />
              <th
                className={`${!indexPattern.timeFieldName && 'hidden'}`}
                width={this.getHeaderWidth(indexPattern.timeFieldName)}
              >
                <span>
                  Time
                  <button
                    className={timeCls}
                    onClick={() => this.cycleSortOrder(this.props.timeFieldName)}
                    tooltip="Sort by time"
                  />
                </span>
              </th>
              {
                this.props.columns.map((name) => {
                  const sortable = this.isSortableColumn(name);
                  const removable = this.canRemoveColumn(name);
                  const movableLeft = this.canMoveColumnLeft(name);
                  const movableRight = this.canMoveColumnRight(name);
                  const sortCls = classNames(!sortable && 'hidden', this.headerClass(name));

                  return (
                    <th key={name} width={this.getHeaderWidth(name)}>
                      <span>
                        {name}
                        <button
                          className={sortCls}
                          onClick={() => this.cycleSortOrder(name)}
                          tooltip={this.tooltip(name)}
                        />
                      </span>
                      <button
                        className={`${!removable && 'hidden'} fa fa-remove kbnDocTableHeader__move`}
                        onClick={() => this.removeColumn(name)}
                        tooltip="Remove column"
                      />
                      <button
                        className={`${!movableLeft && 'hidden'} fa fa-angle-double-left kbnDocTableHeader__move`}
                        onClick={() => this.moveColumnLeft(name)}
                        tooltip="Move column to the left"
                      />
                      <button
                        className={`${!movableRight && 'hidden'} fa fa-angle-double-right kbnDocTableHeader__move`}
                        onClick={() => this.moveColumnRight(name)}
                        tooltip="Move column to the right"
                      />
                    </th>
                  );
                })
              }
            </tr>
          </thead>
        </table>
      </div>
    );
  }
}

KuiStickyHeader.propTypes = {
  headerEl: PropTypes.string,
  groupName: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.string),
  indexPattern: PropTypes.object,
  sortOrder: PropTypes.arrayOf(PropTypes.string),
  onChangeSortOrder: PropTypes.func,
  onMoveColumn: PropTypes.func,
  onRemoveColumn: PropTypes.func
};
