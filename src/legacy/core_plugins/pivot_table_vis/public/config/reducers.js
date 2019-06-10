const _findKeyByFieldId = (field, row) => {
  const fieldId = field.id;
  const metricIds = row.metricId;

  let colId = undefined;

  if(fieldId in metricIds) {
    colId = metricIds[fieldId];
  }

  return colId;
};


export default {
  'aggCount': (row, memo, filter, fields, rows, id) => {
    return {
      'aggCount': (memo['aggCount' + '_' + id] || 0) + 1
    };
  },
  'aggMax': (row, memo, filter, fields, rows, id) => {
    const fId = _findKeyByFieldId(fields[0], row);

    return {
      'aggMax': memo['aggMax' + '_' + id] &&
      (memo['aggMax' + '_' + id] >= parseFloat(row[fId])) ? memo['aggMax' + '_' + id] : parseFloat(row[fId])
    };
  },
  'aggMin': (row, memo, filter, fields, rows, id) => {
    const fId = _findKeyByFieldId(fields[0], row);
    return {
      'aggMin': memo['aggMin' + '_' + id] &&
      (memo['aggMin' + '_' + id] <= parseFloat(row[fId])) ? memo['aggMin' + '_' + id] : parseFloat(row[fId])
    };
  },
  'aggSum': (row, memo, filter, fields, rows, id) => {
    const sum = fields.reduce((curr, field) => {
      const fId = _findKeyByFieldId(field, row);
      return curr + parseFloat(row[fId]);
    }, 0);

    return {
      'aggSum': (memo['aggSum' + '_' + id] || 0) + sum
    };
  },
  'aggMinus': (row, memo, filter, fields, rows, id) => {
    const fId1 = _findKeyByFieldId(fields[0], row);
    const fId2 = _findKeyByFieldId(fields[1], row);

    return {
      'aggMinusField_1': (memo['aggMinusField_1' + '_' + id] || 0) + parseFloat(row[fId1]),
      'aggMinusField_2': (memo['aggMinusField_2' + '_' + id] || 0) + parseFloat(row[fId2])
    };
  },
  'aggDivide': (row, memo, filter, fields, rows, id) => {
    const molecular = _findKeyByFieldId(fields[0], row);
    const denominator = _findKeyByFieldId(fields[1], row);

    return {
      'aggDivideMolecular': (memo['aggDivideMolecular' + '_' + id] || 0) + parseFloat(row[molecular]),
      'aggDivideDenominator': (memo['aggDivideDenominator' + '_' + id] || 0) + parseFloat(row[denominator])
    };
  },
  'aggMultiply': (row, memo, filter, fields, rows, id) => {

    const res = fields.reduce((curr, field) => {
      const fId = _findKeyByFieldId(field, row);

      if(fId && fId in row) {
        return curr * parseFloat(row[fId]);
      } else {
        return curr;
      }
    }, 1);

    return {
      'aggMultiply': (memo['aggMultiply' + '_' + id] || 0) + res
    };
  },
  'aggAverage': (row, memo, filter, fields, rows, id) => {
    const fId = _findKeyByFieldId(fields[0], row);
    return {
      'aggAverageCount': (memo['aggAverageCount' + '_' + id] || 0) + 1,
      'aggAverageField': (memo['aggAverageField' + '_' + id] || 0) + parseFloat(row[fId])
    };
  },
  'aggPercentage': (row, memo, filter, fields, rows, id) => {
    const molecular = _findKeyByFieldId(fields[0], row);

    const rowTotal = rows.reduce((total, data) => {
      if(filter && filter(data)) {
        return total + parseFloat(data[molecular]);
      } else {
        return total;
      }
    }, 0);

    return {
      'aggPercentageTotal': ((memo['aggPercentageTotal' + '_' + id] || 0) + parseFloat(row[molecular])),
      'aggPercentageDataTotal': parseFloat(rowTotal)
    };
  }
};
