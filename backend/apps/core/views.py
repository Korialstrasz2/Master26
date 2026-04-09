import socket

from django.http import JsonResponse


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


def pagina_saluto(request):
    ip_server = _ottieni_ip_server(request)
    ip_client = request.META.get("REMOTE_ADDR", "sconosciuto")

    return JsonResponse(
        {
            "messaggio": f"Hello World, {ip_server}",
            "ip_server": ip_server,
            "ip_client": ip_client,
            "stato": "ok",
            "servizio": "pagina_saluto",
        }
    )
