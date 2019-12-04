import _ from 'lodash';

import AGGREGATOR from '../config/aggregators';

const DEFAULT_METRIC_TYPE = AGGREGATOR[0];
const CUST_METRIC_PREFIX = 'Cust_Metric_';

export const generateDataNames = (cols) => {
  const columns = [];
  cols.forEach((col) => {
    const title = col.title;
    const type = col.aggConfig.schema.name;
    const metricId = col.aggConfig.id;

    columns.push({
      'title': title,
      'type': type,
      'id': col.id,
      'metricId': metricId
    });
  });
  return columns;
};

export const generateActiveDimensions = (dimensions) => {
  return dimensions.map((dim) => {
    return dim.title;
  });
};

export const generateDimensions = (colNames) => {
  const dimensions = [];

  colNames.forEach((col) => {
    if(col.type === 'bucket') {
      dimensions.push({
        value: col.id,
        title: col.title,
        id: col.id
      });
    }
  });

  return dimensions;

};

export const generateMetrics = (colNames) => {
  const metrics = [];
  colNames.forEach((col) => {
    const existAlready = metrics.filter((metric) => {
      return metric.title === col.title;
    });

    if(col.type === 'metric' && !existAlready.length) {
      metrics.push({
        id: col.id,
        metricId: col.metricId,
        value: col.title,
        title: col.title,
        type: col.type
      });
    }
  });
  return metrics;
};

export const generateRows = (colNames, rows) => {
  const data = [];
  rows.forEach((row) => {
    const obj = {};
    row.forEach((cell, index) => {
      const formatter = cell.aggConfig.fieldFormatter('text');

      const value = cell.type === 'bucket' ? formatter(cell.value) : cell.value;
      const id = (index < colNames.length) ? colNames[index].id : undefined;
      const metricId = (index < colNames.length) ? colNames[index].metricId : undefined;

      if(id) {
        obj[id] = value;
        obj[id + '_formatter'] = formatter;

        if('metricId' in obj) {
          obj.metricId[metricId] = id;
        } else {
          obj.metricId = {};
          obj.metricId[metricId] = id;
        }
      }

    });
    data.push(obj);
  });
  return data;
};

export const generateReduce = (colNames, cusMetrics, rows) => {
  return (row, memo, filter) => {
    colNames.forEach((col) => {
      if(col.type === 'metric') {
        const currValue = row[col.id];
        // const formatter = memo[col.id + '_formatter'] = row[col.id + '_formatter'];

        memo[col.id] = (memo[col.id] || 0) + currValue;
      }
    });

    if(cusMetrics && cusMetrics.length) {
      cusMetrics.forEach((metric) => {
        const reduce = metric.reduce(row, memo, filter, metric.fields, rows, metric.id);
        Object.keys(reduce).forEach((key) => {
          memo[key + '_' + metric.id] = reduce[key];
        });
      });
    }

    return memo;
  };
};

export const generateCalculations = (colNames, cusMetrics) => {
  const calculations = [];
  colNames.forEach((col) => {
    if(col.type === 'metric') {
      calculations.push({
        id: col.id,
        value: col.id,
        title: col.title,
        className: 'aggValue',
        template: (val, row, id) => {
          let resp = val;
          let formatter = null;

          if(val !== 'undefined' && val.toFixed) {
            const valArr = val.toString().split('.');

            if(valArr.length > 1 && valArr[1].length >= 5) {
              resp = val.toFixed(2);
            }
          }
          if(id in row && (id + '_formatter') in row) {
            formatter = row[id + '_formatter'];
            resp = formatter(resp);
          }
          return resp;
        }
      });
    }
  });

  if(cusMetrics && cusMetrics.length) {
    cusMetrics.forEach((metric) => {
      const calculation = _.cloneDeep(metric.calculation);

      const title = metric.title || metric.label;

      calculation.id = metric.id;
      calculation.title = title;
      calculation.digits = metric.digits;

      calculations.push(calculation);
    });
  }

  return calculations;
};

export const findAggObject = (label) => {
  return AGGREGATOR.find((agg) =>{
    return agg.label === label;
  });
};

export const validateForm = (aggObj) => {
  if(!aggObj) return false;
  if(aggObj.min > aggObj.fields) return false;
  if(aggObj.max && aggObj.max < aggObj.fields) return false;

  return true;
};

export const findCustomizedMetric = (arr) => {
  const resp = [];
  arr.forEach((metric) => {
    const agg = findAggObject(metric.type.label);
    if(agg) {
      const obj = {};
      _.extend(obj,
        agg,
        {
          'id': metric.id,
          'digits': metric.digits,
          'title': metric.label,
          'fields': metric.fields,
          'type': 'metric'
        }
      );
      resp.push(obj);
    }

  });

  return resp;
};

export const generateMetricParams = (metrics) => {
  return metrics.map((metric) => {
    return {
      label: metric.label,
      type: metric.type,
      title: metric.title,
      fields: metric.fields,
      digits: metric.digits
    };
  });
};

export const getDefaultMetricLabel = (metric, metrics) => {
  if(metric) {
    const customizedMetric = metrics;
    let count = 0;

    _.each(customizedMetric, (item) => {
      if(item.type && item.type.label === metric.label) {
        count += 1;
      }
    });

    return metric.label + '_' + count;
  }

  return '';
};

export const createDefaultMetrics = (metrics, options) => {
  const fields = Array.apply(null, { length: DEFAULT_METRIC_TYPE.min }).map(() => {
    return {
      id: options[0].id,
      label: options[0].label,
      value: options[0].label
    };
  });

  return {
    id: CUST_METRIC_PREFIX + metrics.length,
    fields: fields,
    type: DEFAULT_METRIC_TYPE,
    label: getDefaultMetricLabel(DEFAULT_METRIC_TYPE, metrics),
    digits: DEFAULT_METRIC_TYPE.digits
  };
};


export const createNewMetrics = (id, type, metrics, options, digits) => {
  const fields = Array.apply(null, { length: type.min }).map(() => {
    return {
      id: options[0].id,
      label: options[0].label,
      value: options[0].label
    };
  });

  return {
    id: id || CUST_METRIC_PREFIX + metrics.length,
    fields: fields,
    type: type,
    label: getDefaultMetricLabel(type, metrics),
    digits: _.isNumber(digits) ? digits : type.digits
  };
};

export const getUpdatedMetric = (id, fields, type, label, digits) => {
  return {
    id: id,
    fields: fields,
    type: type,
    label: label,
    digits: digits
  };
};
