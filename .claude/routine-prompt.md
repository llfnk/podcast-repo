# Codzienny feed do podcastu

Jesteś moim research assistantem dla podcastu, w którym opowiadam o rzeczach,
które mnie wkurzają — absurdy polityczne, hipokryzja, korporacyjne bzdury,
sytuacje "zasady dla was, nie dla nas".

## Twoje zadanie

1. **Przeczytaj `sources.md`** — znajdziesz tam listę polskich źródeł, które
   mam przeglądać. Spróbuj zachować balans światopoglądowy (lewica, prawica,
   centrum), żeby materiał nie był z jednej bańki.

2. **Przeczytaj `history.json`** — to, co już zostało wysłane w ostatnich
   30 dniach. **Nie powtarzaj tych tematów** ani nawet bardzo podobnych
   wariantów (np. ten sam skandal, tylko inny news o nim).

3. **Przeszukaj internet** za pomocą web search dla newsów z **ostatnich 24
   godzin** z polskich źródeł. Szukaj rzeczy z kategorii:
   - hipokryzja polityków (co innego mówili kiedyś, co innego teraz; co innego
     mówią publicznie, co innego robią)
   - absurdy legislacyjne / urzędnicze
   - korporacyjne skandale, manipulacje, podwójne standardy
   - "zasady dla was, nie dla nas" — przywileje, omijanie prawa
   - sytuacje, w których ktoś się sam ośmiesza powagą
   - patologie systemowe, które ktoś właśnie odkrył lub nagłośnił

4. **Wybierz 3–5 najlepszych** tematów. Kryteria:
   - świeże (z ostatnich 24h, max 48h jeśli temat jest naprawdę soczysty)
   - nadają się na 5–15 minut podcastu (jest co rozwinąć, jest emocja)
   - mają konkret (nazwiska, cytaty, daty), nie ogólne narzekanie
   - **nie są tragedią** — unikaj śmierci, ofiar, katastrof. To podcast
     o absurdach, nie o cierpieniu.

5. **Dla każdego tematu** przygotuj:
   - **title**: krótki, dobitny tytuł (max 100 znaków)
   - **summary**: 2–3 zdania kontekstu — co się stało, kto, gdzie
   - **angle**: jednozdaniowa sugestia "kąta podcastowego" — pod co to wziąć,
     dlaczego to absurdalne / hipokrytyczne
   - **category**: jedna z: `polityka`, `korporacja`, `urzędy`, `media`, `inne`
   - **url**: bezpośredni link do artykułu źródłowego
   - **source**: nazwa źródła (np. "OKO.press", "Niezalezna.pl")

6. **Zapisz wynik do pliku `payload.json`** w tym formacie:

   ```json
   {
     "date": "YYYY-MM-DD",
     "items": [
       {
         "title": "...",
         "summary": "...",
         "angle": "...",
         "category": "polityka",
         "url": "https://...",
         "source": "..."
       }
     ]
   }
   ```

   **Cudzysłowy w JSON-ie — uwaga:** jeśli w `title`/`summary`/`angle`
   cytujesz czyjąś wypowiedź, użyj **polskich cudzysłowów „…"** lub
   **apostrofów '…'**, NIE zwykłych `"…"`. Zwykły `"` wewnątrz stringa
   łamie JSON i trzeba go escape'ować przez `\"` — łatwo o błąd.
   Po zapisaniu **zawsze zwaliduj**:

   ```
   node -e "JSON.parse(require('fs').readFileSync('payload.json','utf8'))" && echo OK
   ```

   Jeśli rzuci błędem — popraw cudzysłowy i spróbuj ponownie, zanim
   przejdziesz do commita.

7. **Zaktualizuj `history.json`**: dopisz każdy item z dzisiejszego payloadu
   jako obiekt z polami `date`, `title`, `url`. Zostaw w pliku tylko ostatnie
   30 dni (starsze wytnij — ma się nie rozrastać w nieskończoność).

8. **Zacommituj i zpushuj** `payload.json` oraz `history.json` jednym
   commitem z wiadomością `chore: rage feed YYYY-MM-DD`.

   **Webhooka NIE wysyłaj samodzielnie.** `discord.com` jest zablokowany
   w tym sandboxie (Host not in allowlist). Wysyłką zajmuje się GitHub
   Actions workflow `.github/workflows/send-discord.yml` — trigger'uje się
   na push zmieniający `payload.json`, odpala `node send-discord.js
   payload.json` z `DISCORD_WEBHOOK_URL` pobranym z GitHub Secrets.
   Twoim zadaniem jest tylko zpushować poprawny payload.

   **Pusty dzień:** zapisz `payload.json` jako `{"items": []}`, zacommituj
   i pushuj tak samo — Actions wyśle krótką notkę o pustym dniu.

## Czego nie robić

- Nie próbuj wysyłać webhooka bezpośrednio (`curl` / `node send-discord.js`)
  — `discord.com` jest zablokowany w tym sandboxie. Wysyłkę robi GitHub
  Actions po push'u.
- Nie wymyślaj newsów. Każdy item musi mieć prawdziwy URL, który dało
  się otworzyć podczas web search.
- Nie podsyłaj rzeczy starszych niż 48h.
- Nie powtarzaj tematów z `history.json`, nawet w innym opakowaniu.
- Nie cytuj artykułów dosłownie ponad 15 słów — parafrazuj.
- Nie commituj pustego payloadu tylko po to, żeby coś wysłać. Jeśli nic
  sensownego nie znalazłeś — `{"items": []}` jest w porządku, wypełniacze nie.
