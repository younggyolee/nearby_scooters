# Run this below in Django shell to get extreme NE lat, NE lon, SW lat and SW lon values of a country.
from world.models import WorldBorder

def get_extreme_lat_lon(coordinates): 
    # coordinates: [ longitude, latitude ]
    # For example, coordinates = [1.3542, 101.1234]
    max_lat = -90
    min_lat = 90
    max_lon = -180
    min_lon = 180
    for c in coordinates:
        max_lat = max(c[1], max_lat)
        min_lat = min(c[1], min_lat)
        max_lon = max(c[0], max_lon)
        min_lon = min(c[0], min_lon)

    return {
        'max_lat': max_lat,
        'min_lat': min_lat,
        'max_lon': max_lon,
        'min_lon': min_lon
    }

country_name = 'Singapore'
country = WorldBorder.objects.get(name=country_name)
country_boundary_coordinates = json.loads(country.mpoly.json)['coordinates'][0][0]
extreme_vals = get_extreme_lat_lon(sg_boundary_coordinates)
print(extreme_vals)
