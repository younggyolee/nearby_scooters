import React from 'react';
import styles from './ControlPanel.module.css';

export default function ControlPanel({
  numberOfScooters,
  setNumberOfScooters,
  radiusKm,
  setRadiusKm,
  latitude,
  longitude
}) {
  return (
    <>
      <div>
        <label htmlFor='numberOfScooters'>
          <h3>Number of scooters:</h3>
          <span>{numberOfScooters}</span>
        </label>
        <input
          type='range'
          min={1}
          max={200}
          value={numberOfScooters}
          onChange={e => setNumberOfScooters(e.target.value)}
          id='numberOfScooters'
        />
      </div>
      <div>
        <label htmlFor='radiusKm'>
          <h3>Search radius (in Kilometer):</h3>
          <span>{radiusKm} Km</span>
        </label>
        <input
          type='range'
          min={0.5}
          max={40}
          value={radiusKm}
          onChange={e => setRadiusKm(e.target.value)}
          id='radiusKm'
        />
      </div>
      <div className={styles.position}>
        <h3>Latitude</h3>
        <span>{latitude}</span>
        <h3>Longitude</h3>
        <span>{longitude}</span>
      </div>
    </>
  );
};