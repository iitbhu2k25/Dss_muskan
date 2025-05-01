
from django.urls import path
from . import views

urlpatterns = [
    path('stp-files/', views.get_stp_files, name='get-stp-files'),
    
    path('process-selected-files/', views.process_selected_files, name='process-selected-files'),
    path('stp-files/<str:file_id>/details/', views.get_file_details, name='stp-file-details'),
]
