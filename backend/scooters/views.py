from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import Distance as DistanceMeasure
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
import json
import random
from .models import Scooter
from world.models import WorldBorder

SINGAPORE_MAX_BOUNDS = {
    'max_lat': 1.445277,
    'min_lat': 1.258889,
    'max_lon': 103.998863,
    'min_lon': 103.640808
}

@csrf_exempt
def nearby(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            try:
                lat = float(data['latitude'])
                lon = float(data['longitude'])
                radius_km = float(data['radiusKm'])
                number_of_scooters = float(data['numberOfScooters'])
            except Exception as e:
                return HttpResponse(status=400)

            user_location = Point(x=lon, y=lat, srid=4326)
            scooters = Scooter.objects.filter(
                location__distance_lte=(user_location, DistanceMeasure(km=radius_km))
            ).annotate(
                distance=Distance('location', user_location)
            ).order_by('distance')[0 : number_of_scooters]
            result = []
            for scooter in scooters:
                result.append({
                    'longitude': scooter.location.x,
                    'latitude': scooter.location.y
                })
            return JsonResponse({ 'scooters': result }, status=200)
        except Exception as e:
            print(e)
            return HttpResponse(status=500)

@csrf_exempt
def populate(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            n = float(data['populateNumber'])
            Scooter.objects.all().delete()

            max_lon = SINGAPORE_MAX_BOUNDS['max_lon']
            min_lon = SINGAPORE_MAX_BOUNDS['min_lon']
            max_lat = SINGAPORE_MAX_BOUNDS['max_lat']
            min_lat = SINGAPORE_MAX_BOUNDS['min_lat']

            scooters = []
            sg = WorldBorder.objects.get(name='Singapore')

            while len(scooters) < n:
                lon = min_lon + (max_lon - min_lon) * random.random()
                lat = min_lat + (max_lat - min_lat) * random.random()
                pnt = Point(x=lon, y=lat)
                if sg.mpoly.contains(pnt):
                    scooters.append(Scooter(location=pnt))
            Scooter.objects.bulk_create(scooters)
            return HttpResponse(status=200)
        except Exception as e:
            print(e)
            return HttpResponse(status=500)
