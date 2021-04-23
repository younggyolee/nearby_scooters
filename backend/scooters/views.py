from .models import Scooter
from world.models import WorldBorder
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import Distance as DistanceMeasure
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random

def get_extreme_lat_lon(coordinates):
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

@csrf_exempt
def nearby(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lat = data['lat']
            lon = data['lon']
            radius_km = data['radiusKm']
            number_of_scooters = data['numberOfScooters']

            user_location = Point(x=lon, y=lat, srid=4326)
            scooters = Scooter.objects.filter(
                location__distance_lte=(user_location, DistanceMeasure(km=radius_km))
            ).annotate(
                distance=Distance('location', user_location)
            ).order_by('distance')[0 : number_of_scooters]
            result = []
            for scooter in scooters:
                result.append({'lon': scooter.location.y, 'lat': scooter.location.x})
            return JsonResponse({'data': result}, status=200)
        except Exception as e:
            print(e)
            return HttpResponse(status=500)

@csrf_exempt
def populate(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            n = body['numberOfScooters']
            Scooter.objects.all().delete()

            sg = WorldBorder.objects.get(name='Singapore')
            sg_boundary_coordinates = json.loads(sg.mpoly.json)['coordinates'][0][0]
            extreme_vals = get_extreme_lat_lon(sg_boundary_coordinates)
            min_lat = extreme_vals['min_lat']
            max_lat = extreme_vals['max_lat']
            min_lon = extreme_vals['min_lon']
            max_lon = extreme_vals['max_lon']

            count = 0
            while (count < n):
                lat = min_lat + (max_lat - min_lat) * random.random()
                lon = min_lon + (max_lon - min_lon) * random.random()
                pnt = Point(x=lon, y=lat)
                if sg.mpoly.contains(pnt):
                    count += 1
                    s = Scooter(location=pnt)
                    s.save()
            return HttpResponse(status=200)
        except Exception as e:
            print(e)
            return HttpResponse(status=500)
