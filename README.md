# eMAG to Pinterest Bot (React & Full-Stack Node.js)

Un bot complet și panou de control pentru automatizarea publicării produselor din eMAG, Profitshare și 2Performant direct pe Pinterest, folosind Google Gemini 3.8 Flash pentru generarea automată a conținutului persuasiv în limba română și Pinterest API v5 pentru publicare.

## Funcționalități Cheie

- **Generare Conținut cu Gemini AI (`gemini-3.8-flash`)**:
  - Titlu Pin atractiv, scurt, cu cuvinte cheie căutate (max 100 caractere).
  - Descriere persuasivă orientată pe beneficii, urmată de Call To Action: *"Apasă pentru detalii și preț pe eMAG"*.
  - 4-5 hashtag-uri relevante la final.
- **Integrare Pinterest API v5**:
  - Publicare directă de Pin-uri (`POST https://api.pinterest.com/v5/pins`) cu imagine, titlu, descriere și link afiliat.
  - Preluare automată a board-urilor utilizatorului (`GET https://api.pinterest.com/v5/boards`).
- **Autofill Metadate Produs din URL**:
  - Extrage automat titlul, imaginea și categoria direct din orice URL de produs eMAG sau link de afiliere.
- **Auto-Pilot Scheduler (Cron)**:
  - Replică automatizarea cron (implicit la 4 ore) și permite rulare la cerere (*Run Now* / echivalent `workflow_dispatch`).
- **Previzualizare Pin în Stil Pinterest**:
  - Format 2:3 / 4:3, buton "Salvează", insignă destinație afiliat, editare manuală înainte de publicare.
- **Jurnal Activitate în Timp Real**:
  - Urmărire apeluri API, status răspunsuri HTTP (201 Created) și mesaje informative.

## Configurare

Variabile de mediu configurabile în `.env`:

```env
PORT=3000
GEMINI_API_KEY=cheia_ta_gemini
PINTEREST_ACCESS_TOKEN=token_tau_pinterest_v5
PINTEREST_BOARD_ID=id_ul_boardului_pinterest
```

*Notă:* Token-ul Pinterest și Board ID pot fi configurate și direct din interfață prin panoul de setări.