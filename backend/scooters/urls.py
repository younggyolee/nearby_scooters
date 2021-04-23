from django.urls import path

from . import views

urlpatterns = [
    path('nearby/', views.nearby),
    path('populate/', views.populate),
]
