##Backend
https://github.com/SE-Projekt-Team-4/backend

Lokales Testen:
Zum lokalen testen muss Node Package Manager und Node.JS installiert sein.

Gehen sie in den Ordner "corona_server" und führen den Befehl "npm install" aus, um alle relevanten Module zu installieren.
Danach können sie den Server mit dem Befehl "node index.js" im selben Ordner ausführen, um den Server zu starten.
Der Server wird dann standardmäßig auf Port 8000, localhost gestartet.

Deployment auf Cloud foundry:

Zum Deploymnt auf cloud foundry haben wir Cloud foundry CLI benutzt. Sobald man einen eingerichteten Account hat und auf dem Pc angemeldet ist, kann man einfach im Root Ordner dieses gits den Befehl "cf push" aufrufen, um die App live zu schalten.

Integration des Frontends:

Um das Frontend zu integrieren, fügen sie einen Build des Frontends in den Ordner "reactApps" ein und bennen Sie ihn zu fg08 um.

Das frontend ist dann unter dem Pfad www.example.com/ zu erreichen und die api des backends unter www.example.com/api

Api Routen:

GET /matches -- Gibt alle Spiele zurück

POST /matches -- Erstellt ein neues Spiel *

GET /nextMatch -- Gibt das nächste stattfindende Spiel zurück

GET /matches/[id] -- Gibt ein bestimmtes Spiel zurück

PUT /matches/[id] -- Updated ein Spiel *

DELETE /matches/[id] -- Löscht ein Spiel *

GET /matches/[id]/redeemedBookings -- Gibt eingelösten Buchungen für Spiel zurück *

GET /matches/[id]/bookings -- Gibt alle Buchungen für Spiel zurück *

GET /bookings -- Gibt alle Buchungen zurück *

POST /bookings -- Erstellt eine Buchung

POST /bookings/redeem -- Einlösung eines Buchungscode *

DELETE /bookings/overdue -- Löschen von überfälligen Buchungen *

GET /redeemedBookings -- Gibt eingelöste Buchungen zurück *

GET /isAdmin -- Gibt status code 200 zurück. *

Routen die mit * markiert sind benötigen Basic Auth. Die Sicherheitsdaten für Basic Auth können in der apiRouter Datei angepasst werden.
