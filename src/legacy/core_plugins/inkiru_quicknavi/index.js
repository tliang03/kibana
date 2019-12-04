/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


//INKIRU PLUGIN -- QUICK NAVIGATION
import { resolve } from 'path';

export default function (kibana) {

  return new kibana.Plugin({
    id: 'quicknavi',

    require: ['kibana', 'elasticsearch'],

    uiExports: {
      app: {
        title: 'Quick Navigation',
        order: -1000,
        description: 'Dashboard Quick Navigation',
        icon: 'plugins/quicknavi/icon.png',
        main: 'plugins/quicknavi/app'
      },
      styleSheetPaths: resolve(__dirname, 'public/index.scss')
    },

    config: Joi => {

      return Joi.object({
        enabled: Joi.boolean().default(true),
        indexPrefix: Joi.string().default('.tools.dashboardrank'),
        get_username_from_session: Joi.object({
          enabled: Joi.boolean().default(false),
          key: Joi.string().default('username')
        }).default()
      }).default();
    },

    init: require('./server/init.js'),
  });








}
