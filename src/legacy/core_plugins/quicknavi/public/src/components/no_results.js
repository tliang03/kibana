

import React from 'react';

export const NoResults = () => {
  return (
    <div className={`emptyMessage`}>
      <div>No Dashboard added to List.<br />
        Please click
        <button
          type="button"
          className="kuiIcon fa-plus qn_btn_primary"
        />
         button on the header to start.
      </div>
    </div>

  );
};


export default NoResults;
