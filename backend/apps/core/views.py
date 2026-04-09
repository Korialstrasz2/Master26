import socket

from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


def _ottieni_ip_server(request):
    host = request.get_host().split(":")[0]

    if host and host not in {"localhost", "127.0.0.1", "[::1]"}:
        return host

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except OSError:
        return "127.0.0.1"


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pagina_saluto(request):
    ip_server = _ottieni_ip_server(request)
    ip_client = request.META.get("REMOTE_ADDR", "sconosciuto")

    return Response(
        {
            "messaggio": f"Hello World, {ip_server}",
            "ip_server": ip_server,
            "ip_client": ip_client,
            "stato": "ok",
            "servizio": "pagina_saluto",
            "utente": request.user.get_username(),
        }
    )


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    return Response({"dettaglio": "CSRF cookie impostato"})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username", "")
    password = request.data.get("password", "")

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response(
            {"dettaglio": "Credenziali non valide"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)
    return Response({"dettaglio": "Accesso effettuato", "utente": user.get_username()})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"dettaglio": "Logout effettuato"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({"utente": request.user.get_username()})
