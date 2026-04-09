# Master26 - Django + Next.js Starter

Struttura full-stack pronta per sviluppo locale e futura produzione, con backend Django e frontend React/Next.js + shadcn/ui + Tailwind CSS.

## Stack tecnico

- **Backend:** Django, Django REST Framework, CORS headers, WhiteNoise
- **Frontend:** React, Next.js (App Router), Tailwind CSS, shadcn/ui
- **Deploy readiness:** Gunicorn, Uvicorn, Psycopg, Celery/Redis (già in `requirements.txt`)

## Struttura progetto

```text
Master26/
├── .venv/
├── additional_data_and_tools/
├── apis/
├── backend/
│   ├── apps/core/
│   ├── config/settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── templates/
│   └── manage.py
├── bat/
│   └── start_backend_lan.bat
├── database_backups/
├── exports/
├── frontend/
│   ├── src/app/
│   ├── src/components/ui/
│   └── tailwind.config.ts
├── media/
├── tools/
├── .gitignore
└── requirements.txt
```

## Quick start backend (Django)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

Backend disponibile su:
- `http://127.0.0.1:8000/` → pagina welcome/login (UI server-side).
- `http://127.0.0.1:8000/api/saluto/` → JSON protetto di saluto.

### Avvio rapido su rete locale (Windows)

È disponibile lo script:
- `bat/start_backend_lan.bat`

Cosa fa:
1. esegue `git pull`
2. esegue automaticamente `python manage.py migrate` (evita errori tipo `no such table: django_session`)
3. rileva automaticamente un IP IPv4 locale e stampa l'URL LAN corretto
4. usa `.venv\Scripts\python.exe` se disponibile (evita errori tipo `ModuleNotFoundError: No module named "rest_framework"`)
5. avvia Django su `0.0.0.0:8000` (accessibile dai dispositivi nella stessa LAN)

Quando apri `http://IP_LOCALE_DEL_PC:8000/`, la risposta include:
- `messaggio`: `Hello World, <ip_server>`
- `ip_server`
- `ip_client`

## Quick start frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend disponibile su:
- `http://localhost:3000`


## Autenticazione (produzione-ready)

Il sito ora richiede autenticazione via **sessione Django** (cookie HttpOnly + CSRF).

Endpoint principali backend:
- `GET /auth/csrf/` → imposta cookie CSRF
- `POST /auth/login/` → login con `username` + `password`
- `POST /auth/logout/` → logout
- `GET /auth/me/` → utente corrente
- `GET /` → pagina welcome/login
- `GET /api/saluto/` → endpoint protetto (solo utenti autenticati)

Per creare il primo utente:

```bash
cd backend
python manage.py createsuperuser
```

Frontend:
- imposta `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`)
- se non autenticato, mostra form login
- se autenticato, mostra area protetta

### Riferimento UI pagina login (coerenza visiva)

Per mantenere il sito coerente nel tempo, la pagina `backend/templates/welcome.html` usa la seguente palette e layout:

- **Palette colori (CSS custom properties):**
  - `--bg: #17110a`
  - `--panel: rgba(40, 28, 18, 0.92)`
  - `--panel-border: rgba(201, 162, 92, 0.5)`
  - `--text: #f7ecd7`
  - `--muted: #dfcbab`
  - `--accent: #c6953f`
  - `--accent-strong: #e0b35f`
  - `--danger: #ff9d8c`
  - `--success: #9de2a7`

- **Layout pagina:**
  - contenitore principale `.layout` a due colonne (`1.15fr 0.85fr`) con gap `1.25rem`
  - due pannelli `.panel` con bordo dorato, sfondo scuro semi-trasparente e ombra morbida
  - colonna sinistra: titolo e descrizione narrativa del gioco
  - colonna destra: portale autenticazione con tab **Accedi/Registrati**
  - breakpoint responsive a `860px`: layout a colonna singola


### Registrazione: codice numerico obbligatorio

La creazione di un nuovo utente richiede ora **3 campi**:
- `username`
- `password`
- `codice_registrazione` (numero)

Il valore numerico inserito viene salvato come unico contenuto del file:
- `additional_data_and_tools/register_code.txt`

## Gestione settings Django

Il modulo settings è organizzato così:

- `config.settings.base`: configurazione condivisa
- `config.settings.dev`: configurazione sviluppo
- `config.settings.prod`: configurazione produzione

Default locale in `manage.py`: `config.settings.dev`.

## Skeleton app dopo login (frontend)

Dopo il login, l'utente entra nella struttura principale sempre presente chiamata **skeleton**:

- **Top bar fissa** sempre visibile con:
  - quick link `Dadi`
  - quick link `Competenze`
  - nome utente sulla destra
- **Side bar sinistra** con **12 pulsanti** di navigazione (auto-collapse dopo 3 secondi):
  - `Menu`, `Combat`, `PG`, `Negozio`, `Skill`, `Lore`, `Guide`, `Mappa`, `Inventario`, `Quest`, `Social`, `Eventi`
- Le pagine dell'app (incluso il **Main Menu**) sono componenti renderizzati **dentro** questa skeleton.

### Main Menu (placeholder attuale)

Nel main menu sono presenti pulsanti non ancora attivi:
- `Seleziona PG`
- `Impostazioni Utente`
- `Admin`

Il pulsante **Admin** è cliccabile solo se in `localStorage` la variabile:
- `isMaster` è `true`

Se `isMaster === true`, il pulsante porta a:
- pagina Django Admin (`/admin/` del backend)

## Metodo di comunicazione frontend ↔ backend

Best practice raccomandata: usare **un metodo client unico** (es. `chiamaBackend(payload)`), che invia un JSON strutturato con header semantico, ad esempio:

```json
{
  "header": {
    "tipo_chiamata": "query",
    "servizio": "utenti",
    "azione": "lista"
  },
  "body": {
    "filtri": {
      "attivo": true
    }
  }
}
```

Il backend interpreta `header.tipo_chiamata`, `header.servizio` e `header.azione` per instradare la logica applicativa.

## Best practices (team)

1. **Naming convention in italiano:**
   - variabili: `snake_case` in italiano (`nome_utente`, `data_creazione`)
   - funzioni: verbo + contesto (`calcola_totale`, `invia_notifica`)
   - classi: `PascalCase` (`GestoreOrdini`, `ServizioPagamento`)

2. **Separazione responsabilità:**
   - backend: logica, validazioni, autorizzazioni
   - frontend: presentazione, stato UI, UX

3. **Configurazioni sensibili:**
   - usare `.env` per segreti, host, credenziali
   - non committare mai segreti in repository

4. **API contracts stabili:**
   - documentare ogni payload JSON
   - versionare endpoint e contratti quando cambiano

5. **Qualità codice:**
   - lint/format automatici
   - test minimi per endpoint e componenti critici
