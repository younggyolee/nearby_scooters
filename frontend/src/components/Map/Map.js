import React, { useCallback } from 'react';
import ReactMapGL, { Marker, Source, Layer, ScaleControl } from 'react-map-gl';
import Pin from './Pin/Pin';

export default function Map({
  viewport,
  setViewport,
  marker,
  setMarker,
  radiusKm,
  nearbyScooters
}) {
  const sgMaxBounds = {
    swLat: 1.258889,
    swLon: 103.640808,
    neLat: 1.47,
    neLon: 103.998863
  };

  const onMarkerDrag = useCallback(event => {
    setMarker({
      latitude: event.lngLat[1],
      longitude: event.lngLat[0]
    });
  }, [setMarker]);

  const onMarkerDragEnd = useCallback(event => {
    let longitude = event.lngLat[0];
    let latitude = event.lngLat[1];
    latitude = latitude < sgMaxBounds.swLat ? sgMaxBounds.swLat : latitude;
    latitude = latitude > sgMaxBounds.neLat ? sgMaxBounds.neLat : latitude;
    longitude = longitude < sgMaxBounds.swLon ? sgMaxBounds.swLon : longitude;
    longitude = longitude > sgMaxBounds.neLon ? sgMaxBounds.neLon : longitude;
    setMarker({
      latitude,
      longitude
    });
  }, [setMarker, sgMaxBounds.swLat, sgMaxBounds.swLon, sgMaxBounds.neLat, sgMaxBounds.neLon]);

  const circleGeojson = {
    type: 'FeatureCollection',
    features: [
      {type: 'Feature', geometry: {type: 'Point', coordinates: [marker.longitude, marker.latitude]}}
    ]
  };
  const circleLayerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': (2 ** viewport.zoom) / 78271.484 / (Math.cos(marker.latitude * Math.PI / 180)) * (radiusKm * 1000),
      'circle-color': '#007cbf',
      'circle-opacity': 0.5
    }
  };

  return (
      <ReactMapGL
        {...viewport}
        width='100%'
        height='100%'
        mapStyle='mapbox://styles/mapbox/light-v9'
        onViewportChange={(viewport) => {
          setViewport(viewport)
        }}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      >
        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          offsetTop={-20}
          offsetLeft={-10}
          draggable
          onDrag={onMarkerDrag}
          onDragEnd={onMarkerDragEnd}
        >
          <Pin size={30} />
        </Marker>

        <Source id="circle-source" type="geojson" data={circleGeojson}>
          <Layer {...circleLayerStyle} />
        </Source>

        {
          nearbyScooters.map((s, index) => {
            const width = Math.pow(2,(viewport.zoom - 8))
            return (
                <Marker
                key={index}
                latitude={s.latitude}
                longitude={s.longitude}
                offsetTop={-2 * width}
                >
                <img
                  src={process.env.PUBLIC_URL + 'scooter.png'}
                  width={`${width}px`}
                  alt='beam-scooter'
                />
                </Marker>
            );
          })
        }

        <ScaleControl maxWidth={100} unit='metric' stype={{left: 20, bottom: 100}} />
      </ReactMapGL>
  );
};
