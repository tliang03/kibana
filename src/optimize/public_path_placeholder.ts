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

import Stream from 'stream';
import Fs from 'fs';

import * as Rx from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { createReplaceStream } from '../legacy/utils';

export const PUBLIC_PATH_PLACEHOLDER = '__REPLACE_WITH_PUBLIC_PATH__';

interface ClosableTransform extends Stream.Transform {
  close(): void;
}

export function replacePlaceholder(read: Stream.Readable, replacement: string) {
  const replace = createReplaceStream(PUBLIC_PATH_PLACEHOLDER, replacement);

  // handle errors on the read stream by proxying them
  // to the replace stream so that the consumer can
  // choose what to do with them.
  Rx.fromEvent(read, 'error')
    .pipe(take(1), takeUntil(Rx.fromEvent(read, 'end')))
    .forEach(error => {
      replace.emit('error', error);
      replace.end();
    });

  const closableReplace: ClosableTransform = Object.assign(replace, {
    close: () => {
      read.unpipe();

      if ('close' in read) {
        (read as Fs.ReadStream).close();
      }
    },
  });

  return read.pipe(closableReplace);
}
