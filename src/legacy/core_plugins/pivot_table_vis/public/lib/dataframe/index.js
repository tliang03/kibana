const _ = {
  extend: require('lodash/extend'),
  each: require('lodash/each'),
  sortBy: require('lodash/sortBy'),
  find: require('lodash/find')
};

module.exports = function (opts) { return new DataFrame(opts); };

function DataFrame(opts) {
  this.rows = opts.rows;
  this.dimensions = opts.dimensions;
  this.reduce = opts.reduce;
  this.cache = {};

  return this;
}

DataFrame.prototype.calculate = function (opts) {
  this.activeDimensions = opts.dimensions;
  if (this.activeDimensions.length < 1) this.activeDimensions = [''];
  this.sortBy = opts.sortBy;
  this.sortDir = opts.sortDir;
  this.filter = opts.filter;
  this.compact = opts.compact;

  const results = this.getResults();
  const resultRows = this.parseResults(results);

  return resultRows;
};

DataFrame.prototype.getResults = function () {
  const self = this;

  // const columns = this.getColumns();

  const activeDimensions = this.activeDimensions;
  const filter = this.filter;
  const reduce = this.reduce;

  const results = {};
  const setKeyCache = {};

  this.rows.forEach(function (row) {
    const setKeys = self.createSetKeys(activeDimensions, row);
    const dVals = parseSetKey(setKeys[setKeys.length - 1]);
    if (filter && !filter(dVals)) return;

    let curLevel = results;

    setKeys.forEach(function (setKey) {
      if (!curLevel[setKey]) {
        curLevel[setKey] = { value: {}, subDimensions: {}, key: setKey };
      }

      const result = curLevel[setKey].value;

      if (filter || !self.cache[setKey]) {
        if (!filter) setKeyCache[setKey] = result;

        _.extend(result, reduce(row, result, filter));

        const dimensionVals = parseSetKey(setKey);

        _.extend(result, dimensionVals);
      } else {
        curLevel[setKey].value = self.cache[setKey];
      }

      curLevel = curLevel[setKey].subDimensions;
    });
  });

  _.each(setKeyCache, function (cache, key) {
    self.cache[key] = cache;
  });

  return results;

};

DataFrame.prototype.parseResults = function (results, level) {
  const self = this;
  level = level || 0;
  const rows = [];

  const sorted = _.sortBy(results, this.getSortValue.bind(this));

  if (this.sortDir === 'desc') sorted.reverse();

  _.each(sorted, function (dimension) {
    const total = dimension.value;
    total._level = level;
    total._key = dimension.key;

    const numSubDimensions = Object.keys(dimension.subDimensions).length;

    if(self.compact && (numSubDimensions === 1)) {
      // don't push the row
    } else {
      rows.push(total);
    }

    if (numSubDimensions) {
      const subLevel = (self.compact && numSubDimensions === 1) ? level : level + 1;
      const subRows = self.parseResults(dimension.subDimensions, subLevel);
      subRows.forEach(function (subRow) {
        rows.push(subRow);
      });
    }
  });

  return rows;
};

DataFrame.prototype.getColumns = function () {
  const columns = [];

  this.dimensions.forEach(function (d) {
    columns.push({ type: 'dimension', title: d, value: d });
  });

  return columns;
};

DataFrame.prototype.createSetKeys = function (dimensions, row) {
  const keys = [];

  for (let i = 0; i < dimensions.length; i++) {
    const sds = dimensions.slice(0, i + 1);
    keys.push(this.createSetKey(sds, row));
  }

  return keys;
};

DataFrame.prototype.createSetKey = function (dimensions, row) {
  const self = this;

  let key = '';

  _.sortBy(dimensions).forEach(function (dTitle) {
    const dimension = self.findDimension(dTitle);
    key += [dTitle, getValue(dimension, row)].join('\xff') + '\xff';
  });

  return key;
};

DataFrame.prototype.findDimension = function (title) {
  return _.find(this.dimensions, function (d) {
    return d.title === title;
  });
};

DataFrame.prototype.getSortValue = function (result) {
  const sortBy = this.sortBy;
  const columns = this.getColumns();
  const sortCol = _.find(columns, function (c) {
    return c.title === sortBy;
  }) || sortBy;

  const val = getValue(sortCol, result.value);
  if (typeof val === 'undefined') return result.key;

  if (!isNaN(parseFloat(val)) && isFinite(val)) {
    return +val;
  } else if (typeof val === 'string') {
    return val.toLowerCase();
  } else {
    return val;
  }

};

function parseSetKey(setKey) {
  const parsed = {};
  const kvPairs = setKey.split('\xff');
  for (let i = 0; i < kvPairs.length; i += 2) {
    const dTitle = kvPairs[i];
    const dVal = kvPairs[i + 1];

    if (dTitle) parsed[dTitle] = dVal;
  }
  return parsed;
}

function getValue(col, row) {
  if (col === null || col === undefined) return null;

  let val = null;

  if (typeof col === 'string') {
    val = row[col];
  } else if (typeof col === 'function') {
    val = col(row);
  } else if (typeof col.value === 'string') {
    val = row[col.value];
  } else {
    val = col.value(row);
  }
  return val;
}
