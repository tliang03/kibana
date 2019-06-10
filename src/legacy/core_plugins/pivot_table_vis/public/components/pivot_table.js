
import React from 'react';
import * as UtilLibs from '../lib/util';

const ReactPivot = require('../lib/react_pivot/index');

function PivotTableVisComponent({ rows, dimensions,  metrics, customizedMetric, activeDimensions, nPaginateRows }) {
  return (
    <div>
      <div className="pivot-container">
        {
          rows.length &&
            <ReactPivot
              rows={rows}
              dimensions={dimensions}
              calculations={UtilLibs.generateCalculations(metrics, customizedMetric)}
              reduce={UtilLibs.generateReduce(metrics, customizedMetric, rows)}
              activeDimensions={activeDimensions}
              solo={{}}
              nPaginateRows={nPaginateRows}
            />
        }
        {
          !rows.length &&
          <div>No Data</div>
        }
      </div>
    </div>
  );
}

export { PivotTableVisComponent };
