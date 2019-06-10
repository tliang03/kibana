import _ from 'lodash';

const numberWithCommas = (x) => {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export default {
  'aggCount': {
    'value': (dimension, row) => {

      return row['aggCount' + '_' + dimension.id];

    },
    'className': 'aggValue',
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 0));

      } else {

        return numberWithCommas(val);

      }
    }
  },
  'aggDivide': {
    'value': (dimension, row) => {
      return row['aggDivideMolecular' + '_' + dimension.id] / row['aggDivideDenominator' + '_' + dimension.id];
    },
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 3));

      } else {

        return numberWithCommas(val);

      }

    },
    'className': 'aggValue'
  },
  'aggMinus': {
    'value': (dimension, row) => {
      return row['aggMinusField_1' + '_' + dimension.id] - row['aggMinusField_2' + '_' + dimension.id];
    },
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 3));

      } else {

        return numberWithCommas(val);

      }

    },
    'className': 'aggValue'
  },
  'aggPercentage': {
    'value': (dimension, row) => {

      return (row['aggPercentageTotal' + '_' + dimension.id] / row['aggPercentageDataTotal' + '_' + dimension.id]) * 100;

    },
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 2)) + '%';

      } else {

        return numberWithCommas(val) + '%';

      }

    },
    'className': 'aggValue'
  },
  'aggMax': {
    'value': (dimension, row) => {

      return row['aggMax' + '_' + dimension.id];

    },
    'className': 'aggValue',
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 2));

      } else {

        return numberWithCommas(val);

      }

    }
  },
  'aggMin': {
    'value': (dimension, row) => {

      return row['aggMin' + '_' + dimension.id];

    },
    'className': 'aggValue',
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 2));

      } else {

        return numberWithCommas(val);

      }

    }
  },
  'aggSum': {
    'value': (dimension, row) => {

      return row['aggSum' + '_' + dimension.id];

    },
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        if(_.isNumber(digits)) {

          return numberWithCommas(val.toFixed(digits));

        } else {

          const valArr = val.toString().split('.');

          if(valArr.length > 1 && valArr[1].length >= 5) {

            return numberWithCommas(val.toFixed(2));

          }
        }
      }

      return numberWithCommas(val);

    },
    'className': 'aggValue'
  },
  'aggMultiply': {
    'value': (dimension, row) => {

      return row['aggMultiply' + '_' + dimension.id];

    },
    'template': (val, row, valueFunc, digits) => {
      if(val.toFixed) {

        if(_.isNumber(digits)) {

          return numberWithCommas(val.toFixed(digits));

        } else {

          const valArr = val.toString().split('.');

          if(valArr.length > 1 && valArr[1].length >= 5) {

            return numberWithCommas(val.toFixed(2));

          }
        }
      }

      return numberWithCommas(val);
    },
    'className': 'aggValue'
  },
  'aggAverage': {
    'value': (dimension, row) => {

      return row['aggAverageField' + '_' + dimension.id] / row['aggAverageCount' + '_' + dimension.id];

    },
    'template': (val, row, valueFunc, digits) => {

      if(val.toFixed) {

        return numberWithCommas(val.toFixed(_.isNumber(digits) ? digits : 3));

      } else {

        return numberWithCommas(val);

      }
    },
    'className': 'aggValue'
  }
};
