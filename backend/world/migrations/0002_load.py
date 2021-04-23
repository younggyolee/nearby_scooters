from django.db import migrations
from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from world.models import WorldBorder

world_mapping = {
    'fips' : 'FIPS',
    'iso2' : 'ISO2',
    'iso3' : 'ISO3',
    'un' : 'UN',
    'name' : 'NAME',
    'area' : 'AREA',
    'pop2005' : 'POP2005',
    'region' : 'REGION',
    'subregion' : 'SUBREGION',
    'lon' : 'LON',
    'lat' : 'LAT',
    'mpoly' : 'MULTIPOLYGON',
}

world_shp = Path(__file__).resolve().parent.parent / 'data' / 'TM_WORLD_BORDERS-0.3.shp'

def load(apps, schema_editor):
    lm = LayerMapping(WorldBorder, world_shp, world_mapping, transform=False)
    lm.save(strict=True, verbose=True)

class Migration(migrations.Migration):
    dependencies = [
        ('world', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load)
    ]
