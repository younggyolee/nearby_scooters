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

  const convertMeterToPixel = (zoom, latitude, meter) => {
    return (2 ** zoom) / 78271.484 / Math.cos(latitude * Math.PI / 180) * meter;
  };

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
      'circle-radius': convertMeterToPixel(viewport.zoom, marker.latitude, radiusKm * 1000),
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
        {
          nearbyScooters.map((s, index) => {
            const width = Math.pow(2,(viewport.zoom - 8))
            return (
                <Marker
                  key={index}
                  latitude={s.latitude}
                  longitude={s.longitude}
                  offsetTop={-2 * width}
                  data-testid='scooter-marker'
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

        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          offsetTop={-15}
          offsetLeft={-15}
          draggable
          onDrag={onMarkerDrag}
          onDragEnd={onMarkerDragEnd}
        >
          <Pin size={30} />
        </Marker>

        <Source id="circle-source" type="geojson" data={circleGeojson}>
          <Layer {...circleLayerStyle} />
        </Source>

        <ScaleControl maxWidth={100} unit='metric' stype={{left: 20, bottom: 100}} />
      </ReactMapGL>
  );
};
