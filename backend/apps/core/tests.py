from pathlib import Path

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


class TestAutenticazione(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="mario", password="PasswordSicura123!"
        )

    def test_endpoint_protetto_richiede_login(self):
        response = self.client.get(reverse("pagina_saluto"))

        self.assertEqual(response.status_code, 403)

    def test_login_e_accesso_endpoint_protetto(self):
        self.client.get(reverse("csrf_token"))
        response_login = self.client.post(
            reverse("login_view"),
            {"username": "mario", "password": "PasswordSicura123!"},
            content_type="application/json",
        )

        self.assertEqual(response_login.status_code, 200)

        response_dashboard = self.client.get(reverse("pagina_saluto"))
        self.assertEqual(response_dashboard.status_code, 200)
        self.assertEqual(response_dashboard.json()["utente"], self.user.username)

    def test_logout_revoca_accesso(self):
        self.client.force_login(self.user)
        response_logout = self.client.post(reverse("logout_view"))

        self.assertEqual(response_logout.status_code, 200)

        response_dashboard = self.client.get(reverse("pagina_saluto"))
        self.assertEqual(response_dashboard.status_code, 403)

    def test_registrazione_player(self):
        response = self.client.post(
            reverse("register_view"),
            {
                "username": "luigi",
                "password": "PasswordSicura123!",
                "codice_registrazione": 777,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["ruolo"], "player")
        register_code_file = Path(__file__).resolve().parents[3] / "additional_data_and_tools" / "register_code.txt"
        self.assertTrue(register_code_file.exists())
        self.assertEqual(register_code_file.read_text(encoding="utf-8"), "777")

    def test_registrazione_admin_bootstrap(self):
        response = self.client.post(
            reverse("register_view"),
            {
                "username": "master",
                "password": "PasswordSicura123!",
                "codice_registrazione": 999,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["ruolo"], "admin")

    def test_registrazione_rifiuta_codice_non_numerico(self):
        response = self.client.post(
            reverse("register_view"),
            {
                "username": "peach",
                "password": "PasswordSicura123!",
                "codice_registrazione": "abc",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
