from django.contrib import admin
from django.urls import path

from apps.core.views import pagina_saluto

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", pagina_saluto, name="pagina_saluto"),
]
