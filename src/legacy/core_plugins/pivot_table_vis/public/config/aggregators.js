import reducers from './reducers';
import calculators from './calculators';


export default [
  {
    label: 'Count',
    value: 'aggCount',
    reduce: reducers.aggCount,
    calculation: calculators.aggCount,
    min: 1,
    max: 1
  },
  {
    label: 'Sum',
    value: 'aggSum',
    reduce: reducers.aggSum,
    calculation: calculators.aggSum,
    min: 1
  },
  {
    label: 'Minus',
    value: 'aggMinus',
    reduce: reducers.aggMinus,
    calculation: calculators.aggMinus,
    min: 2,
    max: 2
  },
  {
    label: 'Multiply',
    value: 'aggMultiply',
    reduce: reducers.aggMultiply,
    calculation: calculators.aggMultiply,
    min: 1
  },
  {
    label: 'Divide',
    value: 'aggDivide',
    reduce: reducers.aggDivide,
    calculation: calculators.aggDivide,
    min: 2,
    max: 2
  },
  {
    label: 'Percentage',
    value: 'aggPercentage',
    reduce: reducers.aggPercentage,
    calculation: calculators.aggPercentage,
    min: 1,
    max: 1
  },
  {
    label: 'Max',
    value: 'aggMax',
    reduce: reducers.aggMax,
    calculation: calculators.aggMax,
    min: 1,
    max: 1
  },
  {
    label: 'Min',
    value: 'aggMin',
    reduce: reducers.aggMin,
    calculation: calculators.aggMin,
    min: 1,
    max: 1
  },
  {
    label: 'Average',
    value: 'aggAverage',
    reduce: reducers.aggAverage,
    calculation: calculators.aggAverage,
    min: 1,
    max: 1
  }
];
