import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './App.module.css';
import axios from 'axios';
import ReactMapGL, { Marker, Source, Layer, ScaleControl } from 'react-map-gl';
import Pin from './pin';
const _ = require('lodash');

export default function App() {
  const [marker, setMarker] = useState({
    latitude: 1.29803,
    longitude: 103.85597
  });

  const [numberOfScooters, setNumberOfScooters] = useState(50);
  const [radiusKm, setRadiusKm] = useState(10);
  const [nearbyScooters, setNearbyScooters] = useState([]);
  const [populateNumber, setPopulateNumber] = useState(100);
  const maxBounds = {
    swLat: 1.258889,
    swLon: 103.640808,
    neLat: 1.47,
    neLon: 103.998863
  };

  const [isPopulateLoading, setIsPopulateLoading] = useState(false);

  const [viewport, setViewport] = React.useState({
    latitude: 1.29803,
    longitude: 103.85597,
    zoom: 10,
  });

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {type: 'Feature', geometry: {type: 'Point', coordinates: [marker.longitude, marker.latitude]}}
    ]
  };
  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': (2 ** viewport.zoom) / 78271.484 / (Math.cos(marker.latitude * Math.PI / 180)) * (radiusKm * 1000),
      'circle-color': '#007cbf',
      'circle-opacity': 0.5
    }
  };

  const [events, logEvents] = useState({});
  const onMarkerDragStart = useCallback(event => {
    logEvents(_events => ({..._events, onDragStart: event.lngLat}));
  }, []);

  const onMarkerDrag = useCallback(event => {
    logEvents(_events => ({..._events, onDrag: event.lngLat}));
    setMarker({
      longitude: event.lngLat[0],
      latitude: event.lngLat[1]
    });
  }, []);

  const onMarkerDragEnd = useCallback(event => {
    logEvents(_events => ({..._events, onDragEnd: event.lngLat}));
    let longitude = event.lngLat[0];
    let latitude = event.lngLat[1];
    latitude = latitude < maxBounds.swLat ? maxBounds.swLat : latitude;
    latitude = latitude > maxBounds.neLat ? maxBounds.neLat : latitude;
    longitude = longitude < maxBounds.swLon ? maxBounds.swLon : longitude;
    longitude = longitude > maxBounds.neLon ? maxBounds.neLon : longitude;
    setMarker({
      longitude: longitude,
      latitude: latitude
    });
  }, []);

  const debounced = useRef(_.debounce((numberOfScooters, radiusKm, lat, lon) => getNearbyScooters(numberOfScooters, radiusKm, lat, lon), 500));

  useEffect(() => {
    debounced.current(numberOfScooters, radiusKm, marker.latitude, marker.longitude);
  }, [marker.latitude, marker.longitude, numberOfScooters, radiusKm]);

  async function getNearbyScooters(numberOfScooters, radiusKm, lat, lon) {
    const payload = { numberOfScooters, radiusKm, lat, lon };
    const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/scooters/nearby/`, payload);
    setNearbyScooters(data.scooters);
  };

  async function handlePopulateClick(event) {
    const payload = { populateNumber };
    setIsPopulateLoading(true);
    await axios.post(`${process.env.REACT_APP_BACKEND_URL}/scooters/populate/`, payload);
    getNearbyScooters(numberOfScooters, radiusKm, marker.latitude, marker.longitude);
    setIsPopulateLoading(false);
  };

  return (
    <div>
      <h1>Get nearest scooters</h1>
      <div>
        <label>
          Number of scooters:
          <input type='range' min={1} max={100} value={numberOfScooters} onChange={e => setNumberOfScooters(e.target.value)} />
          {numberOfScooters}
        </label>
      </div>
      <div>
        <label>
          Search radius (in Kilometer):
          <input type='range' min={0.5} max={40} value={radiusKm} onChange={e => setRadiusKm(e.target.value)} />
          {radiusKm} Km
        </label>
      </div>
      <div>Latitude: {marker.latitude}</div>
      <div>Longitude: {marker.longitude}</div>

      <div className={styles['map-container']}>
        <ReactMapGL
          {...viewport}
          width='100%'
          height='100%'
          mapStyle='mapbox://styles/mapbox/light-v9'
          onViewportChange={(viewport) => {
            setViewport(viewport)
          }}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          showZoom={true}
        >
          <Source id="my-data" type="geojson" data={geojson}>
            <Layer {...layerStyle} />
          </Source>
          {nearbyScooters.length && nearbyScooters.map((s, index) => {
            const width = Math.pow(2,(viewport.zoom - 8))
            return (
              <Marker
                key={index}
                latitude={s.lat}
                longitude={s.lon}
                offsetTop={-2 * width}
              >
                <img src={process.env.PUBLIC_URL + 'scooter.png'} width={`${width}px`} />
              </Marker>
            );
          })}
          <Marker
            longitude={marker.longitude}
            latitude={marker.latitude}
            offsetTop={-20}
            offsetLeft={-10}
            draggable
            onDragStart={onMarkerDragStart}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          >
            <Pin size={30} />
          </Marker>
          <ScaleControl maxWidth={100} unit='metric' stype={{left: 20, bottom: 100}} />
        </ReactMapGL>
      </div>

      <div>
        <h2>Populate DB</h2>
        Number of scooters to populate:
        <input type='range' min={1} max={1000} value={populateNumber} onChange={e => setPopulateNumber(e.target.value)} />
        {populateNumber}
        <div>
          <button onClick={handlePopulateClick} disabled={isPopulateLoading}>
            {isPopulateLoading ? 'Loading...' : 'Populate scooters in DB'}
          </button>
        </div>
      </div>

    </div>
  );
};
