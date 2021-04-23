from django.contrib.gis.db import models

class Scooter(models.Model):
    location = models.PointField()
