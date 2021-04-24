# Beam - Nearest Scooter Project

## How to setup
- This project was built & tested at Mac OS Big Sur (M1 macbook air, running at Rosetta terminal)

### 1. Backend
- Install Brew first if you haven't https://brew.sh/
- Set up PostgreSQL DB and GeoDjango dependencies
- https://docs.djangoproject.com/en/3.2/ref/contrib/gis/install/postgis/
```
$ brew install postgresql
$ brew install postgis
$ brew install gdal
$ brew install libgeoip

$ createdb beam_db
$ psql
your_user_name=# CREATE ROLE beam WITH LOGIN PASSWORD 'beam2021';
your_user_name=# ALTER ROLE beam SUPERUSER;
your_user_name=# ALTER ROLE beam CREATEDB;
your_user_name=# ALTER DATABASE beam_db OWNER TO beam;
your_user_name=# \c beam_db;
beam_db=# CREATE EXTENSION postgis;
```

- Create Python venv and install Python libraries
- Recommend creating venv using Python 3.9.1
```
$ cd backend
$ python -m venv venv
$ source venv/bin/activate
(venv) $ pip install -r requirements.txt
(venv) $ python manage.py migrate
(venv) $ python manage.py runserver
```

### 2. Frontend
```
$ cd frontend
$ npm install
$ npm start
```
- Go to http://localhost:3000
- On startup, Click Populate to erase existing scooters & randomly populate scooters

![screenshot_1](beam_2.jpg)
![gif_1](beam_1.gif)
![gif_2](beam_2.gif)

## How to run unit test (backend)

```
../backend $ python manage.py test
```
