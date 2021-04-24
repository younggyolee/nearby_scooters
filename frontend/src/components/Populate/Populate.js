import React, { useState } from 'react';
import styles from './Populate.module.css';

export default function ControlPanel({
  onPopulateClick,
  isPopulateLoading
}) {
  const [populateNumber, setPopulateNumber] = useState(100);

  return (
    <>
      <h2>Erase and randomly populate DB</h2>
      <label htmlFor='populateNumber'>
        <h3>Number of scooters to populate:</h3>
        <span>{populateNumber}</span>
      </label>
      <input
        type='range'
        min={1}
        max={5000}
        value={populateNumber}
        onChange={e => setPopulateNumber(e.target.value)}
        id='populateNumber'
      />
      <div className={styles['populate-button']}>
        <button
          onClick={() => onPopulateClick(populateNumber)}
          disabled={isPopulateLoading}
        >
          <span>
            {isPopulateLoading ? 'Loading...' : 'Populate scooters in DB'}
          </span>
        </button>
      </div>
    </>
  );
};
