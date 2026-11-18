from django.contrib import admin
from django.urls import include, path

from tasks.views import dashboard

urlpatterns = [
    path("", dashboard, name="home"),
    path("admin/", admin.site.urls),
    path("api/v1/", include("tasks.urls")),
]
