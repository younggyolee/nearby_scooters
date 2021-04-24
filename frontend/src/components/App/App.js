import React, { useState, useEffect, useRef } from 'react';
import styles from './App.module.css';
import axios from 'axios';
import Map from '../Map/Map';
import ControlPanel from '../ControlPanel/ControlPanel';
import Populate from '../Populate/Populate';

const _ = require('lodash');

export default function App() {
  const [latitude, setLatitude] = useState(1.29803);
  const [longitude, setLongitude] = useState(103.85597);
  const [viewport, setViewport] = useState({
    latitude: 1.29803,
    longitude: 103.85597,
    zoom: 10
  });
  const [numberOfScooters, setNumberOfScooters] = useState(25);
  const [radiusKm, setRadiusKm] = useState(5);
  const [nearbyScooters, setNearbyScooters] = useState([]);
  const [isPopulateLoading, setIsPopulateLoading] = useState(false);

  useEffect(() => {
    debounced.current(
      numberOfScooters,
      radiusKm,
      latitude,
      longitude
    );
  }, [latitude, longitude, numberOfScooters, radiusKm]);

  const debounced = useRef(
    _.debounce(
      (numberOfScooters, radiusKm, latitude, longitude) =>
        getNearbyScooters(numberOfScooters, radiusKm, latitude, longitude),
      500
    )
  );

  async function getNearbyScooters(numberOfScooters, radiusKm, latitude, longitude) {
    const payload = { numberOfScooters, radiusKm, latitude, longitude };
    const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/scooters/nearby/`, payload);
    setNearbyScooters(data.scooters);
  };

  async function handlePopulateClick(populateNumber) {
    const payload = { populateNumber };
    setIsPopulateLoading(true);
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/scooters/populate/`, payload);
    getNearbyScooters(numberOfScooters, radiusKm, latitude, longitude);
    setIsPopulateLoading(false);
  };

  return (
    <div className={styles['app-container']}>
      <h1>Get nearest scooters</h1>
      <div>
        <ControlPanel
          numberOfScooters={numberOfScooters}
          setNumberOfScooters={setNumberOfScooters}
          radiusKm={radiusKm}
          setRadiusKm={setRadiusKm}
          latitude={latitude}
          longitude={longitude}
        />
      </div>
      <div className={styles['map-container']}>
        <Map
          viewport={viewport}
          setViewport={setViewport}
          marker={{ latitude, longitude }}
          setMarker={(marker) => {
            setLatitude(marker.latitude);
            setLongitude(marker.longitude);
          }}
          radiusKm={radiusKm}
          nearbyScooters={nearbyScooters}
        />
      </div>
      <div className={styles['populate-container']}>
        <Populate
          onPopulateClick={handlePopulateClick}
          isPopulateLoading={isPopulateLoading}
        />
      </div>
    </div>
  );
};
