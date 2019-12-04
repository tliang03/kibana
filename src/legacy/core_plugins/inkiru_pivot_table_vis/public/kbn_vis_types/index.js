import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { Schemas } from 'ui/vis/editors/default/schemas';

import { legacyTableResponseHandler } from './response_handler';

import PivotIcon from '../icon.svg';

VisTypesRegistryProvider.register(PivotVisProvider);

function PivotVisProvider(Private, i18n) {
  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createReactVisualization({
    name: 'pivot_table',
    title: 'Pivot Table',
    image: PivotIcon,
    description: i18n('pivottableVis.pivotDescription', {
      defaultMessage: 'Create a pivot data table and add ability to do additional calculation with response results'
    }),
    visConfig: {
      component: require('./pivot_table_vis_controller'),
      defaults: {
        perPage: 15,
        customizedMetric: []
      }
    },
    editorConfig: {
      optionTabs: [
        {
          name: 'advanced',
          title: 'Cusomized Calculation',
          editor: require('../components/customized_calc_editor')
        }
      ],
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: i18n('metricVis.schemas.metricTitle', { defaultMessage: 'Metric' }),
          min: 1,
          aggFilter: ['!geo_centroid'],
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'buckets',
          name: 'bucket',
          title: 'Split Rows'
        }
      ])
    },
    hierarchicalData: function (vis) {
      return Boolean(vis.params.showPartialRows || vis.params.showMetricsAtAllLevels);
    },
    responseHandler: legacyTableResponseHandler
  });
}

export default PivotVisProvider;
