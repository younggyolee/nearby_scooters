import React from 'react';
import { shallow } from 'enzyme';
import Map from './Map';

const setup = (
  viewport,
  marker,
  radiusKm,
  nearbyScooters
) => {
  const actions = {
    setViewport: jest.fn(),
    setMarker: jest.fn()
  };
  const component = shallow(
    <Map
      viewport={viewport}
      marker={marker}
      radiusKm={radiusKm}
      nearbyScooters={nearbyScooters}
      {...actions}
    />
  );
  return {
    component,
    actions,
    scooterMarkers: component.find({ 'data-testid': 'scooter-marker' })
  };
};

describe('Map component', () => {
  let viewport;
  let marker;
  let radiusKm;
  let nearbyScooters;

  beforeEach(() => {
    viewport = {
      latitude: 1.29803,
      longitude: 103.85597,
      zoom: 10
    };
    marker = {
      latitude: 1.29803,
      longitude: 103.85597
    };
    radiusKm = 5
    nearbyScooters = [
      {latitude: 1.3030060857285042, longitude: 103.83687119610691},
      {latitude: 1.2863563914331184, longitude: 103.86084323596255}
    ];
  });

  it ('should render the nearby scooters', () => {
    const { scooterMarkers } = setup(
      viewport,
      marker,
      radiusKm,
      nearbyScooters
    );
    expect(scooterMarkers).toHaveLength(2)
    expect(scooterMarkers.at(0).prop('latitude')).toBe(nearbyScooters[0].latitude)
    expect(scooterMarkers.at(0).prop('longitude')).toBe(nearbyScooters[0].longitude)
    expect(scooterMarkers.at(1).prop('latitude')).toBe(nearbyScooters[1].latitude)
    expect(scooterMarkers.at(1).prop('longitude')).toBe(nearbyScooters[1].longitude)
  });
});
