from django.contrib import admin
from django.urls import path

from apps.core.views import (
    csrf_token,
    login_view,
    logout_view,
    me_view,
    pagina_saluto,
    register_view,
    welcome_page,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", welcome_page, name="welcome_page"),
    path("api/saluto/", pagina_saluto, name="pagina_saluto"),
    path("auth/csrf/", csrf_token, name="csrf_token"),
    path("auth/login/", login_view, name="login_view"),
    path("auth/register/", register_view, name="register_view"),
    path("auth/logout/", logout_view, name="logout_view"),
    path("auth/me/", me_view, name="me_view"),
]
