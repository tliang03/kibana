import React from 'react';

import { EuiToast } from '@elastic/eui';


export default ({ error }) => (
  <EuiToast
    title="Some Error Happened. Please contact Inkiru Tools Team for further investigation."
    color="danger"
    iconType="alert"
    className="errorContainer"
  >
    <p>{error}</p>
  </EuiToast>
);
