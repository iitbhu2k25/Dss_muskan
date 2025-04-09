from django.urls import path
from . import views

urlpatterns = [
    path('well-points/', views.get_well_points, name='get_well_points'),
]
