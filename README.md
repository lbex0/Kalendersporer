# Kalendersporer - Fullstack CAP + OpenUI5 + Cypress

Dette prosjektet består av tre hoveddeler:

- **CAP backend** (Node.js + SQLite)  
- **OpenUI5 frontend**  
- **Cypress E2E‑tester**  

Prosjektet er organisert slik at hver del har sitt eget miljø og egne `node_modules`. Følg instruksjonene nedenfor for å installere, bygge og kjøre alle deler av applikasjonen.

---
## 🔧 Miljøvariabler (.env)

Prosjektet bruker en .env‑fil for å konfigurere CAP‑backend i lokal utvikling. Denne inneholder blant annet mock‑hemmeligheter som brukes til lokal JWT‑generering. Dette prosjektet er ikke en produksjonsapplikasjon, og .env‑verdiene er kun ment for testing og utvikling. Hemmelighetene i denne filen er ikke sensitive og er ikke knyttet til noen ekstern tjeneste.

Eksempelstruktur på .env (ikke faktiske verdier):

```
JWT_SECRET=your-local-dev-jwt-secret
REFRESH_SECRET=your-local-dev-refresh-secret
```
Du trenger ikke å endre noe i .env‑fila for å kjøre prosjektet. Den brukes kun av CAP‑serveren til å kjøre lokalt med mockdata.

## Forutsetninger

Før du begynner må du ha følgende installert:

- **Node.js** (anbefalt 18.x eller nyere)  
- **npm** (følger med Node)  
- **Git**

Ingen pakker er installert i repoet fra før — alle må installeres manuelt etter at du har klonet prosjektet.

---

## Mappestruktur

```
root/
│  cypress.config.js
│  package.json 
│
├─ database/            → Backend (CAP + database)
│   package.json
│
├─ kalendersporer/      → Frontend (OpenUI5)
│   package.json
│
└─ tests/               → Cypress E2E‑tester
```

---

# 1. Backend (CAP) - kjøre database og service

Gå inn i `database/`‑mappen og installer pakkene:

```bash
cd database
npm install
```

Start CAP‑serveren:

```bash
npm start
```

Dette vil starte databasen og OData‑servicen CAP leverer.

---

# 2. Frontend (OpenUI5) - kjøre UI‑applikasjonen

Gå inn i `kalendersporer/`:

```bash
cd kalendersporer
npm install
```

Start OpenUI5‑devserveren:

```bash
npm start
```

Dette vil kjøre UI5‑appen din på lokal server (typisk `http://localhost:8080`).

> Merk: Frontend og backend er adskilt og må kjøres i hver sin terminal.

---

# 3. E2E‑testing med Cypress

Cypress ligger i prosjektets rot og kjører tester mot UI5‑applikasjonen og CAP‑serveren.

Installer Cypress i root‑mappen:

```bash
cd ..
npm install
```

Start Cypress i GUI‑modus:

```bash
npx cypress open
```

Eller kjør testene i headless‑modus:

```bash
npx cypress run
```

Testene ligger i:

```
/tests/
```

og konfigureres via:

```
/cypress.config.js
```

