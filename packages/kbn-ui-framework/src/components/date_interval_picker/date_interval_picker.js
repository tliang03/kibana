/*
 * Jasmine React Patch for Sticky Header
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { IntervalOptions } from './interval_options';

export class KuiDateIntervalPicker extends Component {
  render() {
    const that = this;

    return (
      <div className="kuiDateIntervalWrapper">
        <div className="kuiDateIntervalContent">
          <div className="kuiLocalDropdownTitle kuiDateIntervalTitle">Date Interval</div>
          <div className="kuiLocalMenu kuiDateIntervalMenu">
            {
              IntervalOptions.map((section, index) => {
                return (
                  <div key={index} className="kuiDateIntervalSection">
                    <div className="uiUnstyled">
                      {
                        section.map((intervalObj) => {
                          const display = intervalObj.display;
                          const value = intervalObj.value;
                          const isSelected = !!(intervalObj.value === that.props.selectValue.value);

                          return (
                            <li key={value} className={`${isSelected && 'selected'}`}>
                              <a
                                onClick={() => that.props.onChange(intervalObj)}>
                                {display}
                              </a>
                            </li>
                          );
                        })
                      }
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

KuiDateIntervalPicker.propTypes = {
  selectValue: PropTypes.string,
  onChange: PropTypes.function
};

KuiDateIntervalPicker.defaultProps = {
  selectValue: 'auto',
  onChange: () => {}
};
