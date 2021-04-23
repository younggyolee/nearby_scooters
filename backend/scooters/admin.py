from django.contrib.gis import admin
from .models import Scooter

admin.site.register(Scooter, admin.GeoModelAdmin)
