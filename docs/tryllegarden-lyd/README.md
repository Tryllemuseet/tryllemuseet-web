# Operations Routine: stemmer i Tryllegården

Spillet spiller innspilte klipp der de finnes og bruker nettleserens talesyntese ellers. Uten et eneste klipp fungerer spillet som før.

## Hvordan det henger sammen

- Hver replikk har en **id**: en hash av språk og selve teksten, med navnene satt inn (`Tiril`, `Trym`, `Tryllegården`). Se `web/src/lib/tryllegardenAudio.ts`.
- Klippene ligger i `web/public/audio/tryllegarden/<språk>/<id>.mp3`.
- `web/public/audio/tryllegarden/manifest.json` kobler id til fil. Spillet henter den når siden åpnes.
- Endres en tekst (i koden eller i Studio), eller navnet til Tiril eller Trym, får replikken ny id. Da finnes ingen fil lenger, og spillet faller tilbake til talesyntese. Stemmen kan aldri si noe annet enn det som står på skjermen.
- Gjelder: samtalene, startteksten, oppgaven, hint, gåter, «feil svar», «ferdig», tradisjonsteksten og finalen. Også dekket: triks-kortets tittel og effekt og de faste setningene i minispillene og på kartet. Ikke dekket (bruker syntese): tellingen på kartet, hemmelighetene fra det lukkede området (de skal ikke ligge åpent som lydfiler), lag-selv-trinnene og setninger der navn eller tall settes inn underveis.
- Navnene som brukes når listen lages er standardnavnene. Er navnene endret i `farmGameConfig`, må replikkene tas opp på nytt.
- Replikker med helt lik tekst på flere steder deler ett klipp.

## Lage replikklista

```
node scripts/tryllegarden-audio.mjs list            # norsk
node scripts/tryllegarden-audio.mjs list --lang=en  # engelsk (ingen engelsk innlesing er laget)
```

Skriver `docs/tryllegarden-lyd/replikker-<språk>.md` og `.json`, og `replikker-<språk>-mangler.md` med bare replikkene som ikke har klipp ennå (den som sendes til innspilling). Faste setninger fra minispillene og kartet ligger i `web/src/lib/tryllegardenPhrases.ts` og kommer med automatisk. Gi `brief.md` og `replikker-nb.md` til den som skal lage stemmene (en AI-tjeneste eller en innleser).

## Velge og legge inn

1. Lytt til `v1`, `v2` og `v3` for hver replikk.
2. Kopier de valgte filene til `web/public/audio/tryllegarden/nb/` og gi dem navnet `<id>.mp3` (uten `_v1`).
3. `node scripts/tryllegarden-audio.mjs build`: skriver `manifest.json` og melder hvilke replikker som mangler eller hvilke filer som ikke brukes.
4. Test i spillet med «Les for meg» på, og commit filene og manifestet. Filene ligger i repoet. Hele norske settet er rundt 10 000 tegn, omtrent 10 minutter og 5–7 MB som MP3 ved 64 kbps.

## Etter tekstendringer

Kjør `list` og `build` igjen. `build` skriver «Missing» for replikker uten klipp og «Not used» for klipp som ikke lenger passer en replikk. Slett de ubrukte filene.

## Slå lyd av og på (Studio)

Under «Tryllegården: Innstillinger» finnes to felt:

- **Stemmer og opplesning er på** (`voiceEnabled`): hovedbryteren. Av betyr ingen lyd noe sted: verken innspilte stemmer eller nettleserens opplesning, og høyttaler-knappene og «Les for meg» skjules.
- **Steder og sider uten lyd** (`voiceOffScreens`): kryss av enkelte steder, kartet, startsiden eller finalen. Der skjules høyttaler-knappene og ingenting leses opp, mens resten av spillet har lyd. Nyttig mens en stemme ikke er godkjent ennå.

Spillsiden leses ved hver visning (hurtigbuffer opptil fem minutter), så endringen vises uten nytt bygg. Barnet har i tillegg sin egen bryter, «Les for meg» i linja øverst, som slår automatisk opplesning av og på.
