from django.test import TestCase
from scooters.models import Scooter
from django.contrib.gis.geos import Point
from django.test import Client
from world.models import WorldBorder
import json

csrf_client = Client(enforce_csrf_checks=False)

class ScooterNearbyTestCase1(TestCase):
    def setUp(self):
        Scooter.objects.create(location=Point(103.8, 1.3))
        Scooter.objects.create(location=Point(103.9, 1.31))

    def test_scooters_nearby_post(self):
        c = Client()
        response = c.post(
            path='/scooters/nearby/',
            data={
                'longitude'       : 103.85,
                'latitude'        : 1.305,
                'numberOfScooters': 5,
                'radiusKm': 30
            },
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(json.loads(response.content)['scooters']), 2)

class ScooterNearbyTestCase2(TestCase):
    def setUp(self):
        # Orchard Road
        self.s_orchard = Scooter.objects.create(location=Point(103.83687119610691, 1.3030060857285042))
        # Marina Bay Sands
        self.s_msb = Scooter.objects.create(location=Point(103.86084323596255, 1.2863563914331184))
        # Changi Airport
        self.s_changi = Scooter.objects.create(location=Point(103.99012565306256, 1.3642289473858613))

    def test_scooters_nearby_post(self):
        c = Client()    
        response = c.post(
            path='/scooters/nearby/',
            data={
                # Orchard road
                'longitude'       : 103.83224436126484,
                'latitude'        : 1.30493043862532,
                'numberOfScooters': 2,
                'radiusKm'        : 5
            },
            content_type='application/json'
        )

        scooters_result = json.loads(response.content)['scooters']
        self.assertEqual(response.status_code, 200)
        # it should only return the two scooters in Orchard Road and Marina Bay Sands
        # it should not return the scooter in Changi Aiport
        self.assertEqual(len(scooters_result), 2)
        self.assertEqual(scooters_result[0]['latitude'], self.s_orchard.location.y)
        self.assertEqual(scooters_result[0]['longitude'], self.s_orchard.location.x)
        self.assertEqual(scooters_result[1]['latitude'], self.s_msb.location.y)
        self.assertEqual(scooters_result[1]['longitude'], self.s_msb.location.x)

class ScooterPopulateTestCase(TestCase):
    def setUp(self):
        # Orchard Road
        self.existing_scooter = Scooter.objects.create(location=Point(103.83687119610691, 1.3030060857285042))

    def test_scooters_populate_post(self):
        num_of_scooters_to_populate = 100

        self.assertEqual(len(Scooter.objects.all()), 1)

        c = Client()
        response = c.post(
            path='/scooters/populate/',
            data={
                'populateNumber': num_of_scooters_to_populate
            },
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)

        # it should delete the existing scooters first
        self.assertEqual(len(Scooter.objects.filter(pk=self.existing_scooter.id)), 0)

        # it should create 100 scooters randomly populated in Singapore
        scooters = Scooter.objects.all()
        self.assertEqual(len(scooters), num_of_scooters_to_populate)

        sg = WorldBorder.objects.get(name='Singapore')
        for s in scooters:
            self.assertEqual(sg.mpoly.contains(s.location), True)
