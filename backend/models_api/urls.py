from django.urls import path
from . import views

urlpatterns = [
    path('models/', views.Model3DListCreateView.as_view(), name='model-list-create'),
    path('models/<int:pk>/', views.Model3DDetailView.as_view(), name='model-detail'),
    path('health/', views.health_check, name='health-check'),
]
