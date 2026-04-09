from django.http import JsonResponse


def pagina_saluto(request):
    return JsonResponse(
        {
            "messaggio": "Ciao dal backend Django!",
            "stato": "ok",
            "servizio": "pagina_saluto",
        }
    )
