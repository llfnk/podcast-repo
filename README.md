# podcast-rage-feed

Codzienny feed absurdów, hipokryzji i innych rzeczy do podcastu — Claude Code przeszukuje polski internet, wybiera najlepsze tematy i wrzuca je na Discord webhookiem.

## Jak to działa

1. **Rutyna w Claude Code** odpala się codziennie rano (np. 8:00).
2. Claude przeszukuje polskie źródła z ostatnich 24h pod kątem absurdów politycznych, hipokryzji, korporacyjnych skandali.
3. Sprawdza `history.json` żeby nie powtarzać tego samego.
4. Wybiera 3–5 najlepszych tematów, generuje krótki opis + "kąt podcastowy" dla każdego.
5. Uruchamia `node send-discord.js`, który wysyła ładne embeds na Twój Discord.
6. Dopisuje wysłane do `history.json` i commituje do repo.

## Setup

### 1. Discord webhook

W Discordzie: ustawienia kanału → Integracje → Webhooks → Nowy webhook → skopiuj URL.

### 2. Repo

```bash
git clone <to-repo>
cd podcast-rage-feed
npm install
```

### 3. Lokalny test (opcjonalny)

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
node send-discord.js test-payload.json
```

### 4. Rutyna w Claude Code

1. Wejdź w Claude Code → Routines → New routine.
2. Repository: wybierz to repo.
3. Schedule: codziennie o 8:00 (Twoja strefa).
4. Environment variables: dodaj `DISCORD_WEBHOOK_URL`.
5. Prompt: skopiuj zawartość `.claude/routine-prompt.md`.
6. **Ważne:** w ustawieniach repo odblokuj push poza branch `claude/*` (Claude musi commitować `history.json` do main), albo zostaw default i sam mergeuj PR-y.

## Pliki

- `.claude/routine-prompt.md` — prompt dla rutyny (kopiujesz do UI Claude Code)
- `send-discord.js` — skrypt wysyłający embeds
- `history.json` — co już było wysłane (Claude aktualizuje)
- `sources.md` — lista polskich źródeł do przeglądania (możesz edytować)
- `test-payload.json` — przykładowy input do testu lokalnego

## Tweaking

- **Inne źródła** → edytuj `sources.md`
- **Inny ton / kategorie** → edytuj `.claude/routine-prompt.md`
- **Częstotliwość** → zmień harmonogram rutyny w UI
- **Ile tematów** → zmień liczbę w prompcie
