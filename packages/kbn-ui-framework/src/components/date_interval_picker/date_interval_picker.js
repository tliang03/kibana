/*
 * Jasmine React Patch for Sticky Header
 */

import React from 'react';
import PropTypes from 'prop-types';

import { IntervalOptions } from './interval_options';

const KuiDateIntervalPicker = ({ selectValue, onChange }) => {

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
                        const isSelected = !!(intervalObj.value === selectValue.value);

                        return (
                          <li key={value} className={`${isSelected && 'selected'}`}>
                            <a
                              onClick={() => onChange(intervalObj)}
                            >
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
};

KuiDateIntervalPicker.propTypes = {
  selectValue: PropTypes.string,
  onChange: PropTypes.function
};

KuiDateIntervalPicker.defaultProps = {
  selectValue: 'auto',
  onChange: () => {}
};

export {
  KuiDateIntervalPicker
};
