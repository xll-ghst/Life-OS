
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TaskViewSet, dashboard

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", dashboard, name="dashboard"),
]