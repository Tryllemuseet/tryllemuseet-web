# Illustrasjoner i Det trettende kabinett

27 av 28 scener har nå en illustrasjon i repositoryet. Daggry mangler en egen morgenillustrasjon og beholder tekstvisningen. Sanity-rombildet har forrang over filene nedenfor. Originalenes proporsjoner bevares; ingen beskjæring av romscener. WebP leveres i 760/1280 px bredde. Positurer har transparent bakgrunn.

## Romkoblinger

| Scenenøkkel | Originalfil |
| --- | --- |
| `brevet` | Det forseglede brevet.png |
| `foajeen` | Foajeen med den åpne gjesteboken.png |
| `sandrommet` | Mannen ved bordet med tre kopper.png |
| `speilgangen` | Speilgangen i det trettende kabinett.png |
| `markedsplassen` | Markedsplassens tre mystiske krus.png |
| `epilog` | Bak det burgunderrøde forhenget.png |
| `galleriet` | Seks tomme rammer i nattgalleriet.png |
| `biblioteket` | Den åpne boken i biblioteket.png |
| `oyet` | Det optiske kammeret.png |
| `salongen` | Den mekaniske tyrken i salongen.png |
| `seansen` | Den stille seansen ved rundbordet.png |
| `epilog2` | Trappen videre mot scenen.png |
| `frievalget` | Tre valg i det trettende kabinett.png |
| `teateret` | Åpen rømningskiste på varietéscenen.png |
| `kinoen` | Håndsveivet projektor i den gamle kinosalen.png |
| `lerretet` | Stille kammer med blankt lerret.png |
| `verkstedet` | Det hemmelige illusjonsverkstedet.png |
| `epilog3` | Dempet daggry ved speilgangen.png |
| `minnet` | Minnedugg i speilgangen.png |
| `studioet` | Mentalist i et blått TV-studio.png |
| `trekanten` | Den blanke plansjen i speilgangen.png |
| `gatehjornet` | Gatemagikerens sølvmynt i nattelyset.png |
| `fargene` | Det tomme diagrammet bak den siste døren.png |
| `vinterhagen` | Nordlys over vinterhagen.png |
| `epilog4` | Den siste terskelen.png |
| `porten` | Den siste terskelen.png |
| `kabinettet` | Den tomme scenen og arbeidslyset.png |

## Direktøren

Velkomst i foajeen, presentasjon i gåterommene, hvisken etter vellykket hintforespørsel, tenkende positur etter feil svar, anerkjennelse ved løst oppgave. Kortoverrekkelse i foajeen; ventepositur ved mellomaktene; dørpositur ved siste terskel og porten; applaus etter finaleforestillingen; avskjed ved daggry. Ingen figur i Speilgangens aktive illusjonsrom. Positurer styres av resultatet fra API-et, aldri av en lokal fasit.

## Sanity og hemmelige bilder

Nytt valgfritt `solutionImage` på gameChapter vises sammen med forklaringen etter at serveren har frigitt den. Det inngår bare i den private spørreformen; URL-en skal aldri være i sidens startdata. `curiosityImage` kan erstatte eksisterende emoji i knappene, uten å endre ID, skjermlesertekst, tilgjengelighet eller kortbelønning. Manglende ressurs beholder den eksisterende knappen.

## Gjenstående redaksjonell kontroll

- Daggry: egen morgenillustrasjon mangler.
- Galleriets A/B-motiver er ikke integrert: de endrer mer enn ett element. Eksisterende kodeoppgave beholdes.
- Bibliotekets tresnitt, Kinoens filmruter og Gatehjørnets myntsekvens beholder eksisterende kode/tekst til konsistente serier finnes.
- Kuriositetsbilder kan velges i Sanity. Separate produksjonsbilder er foreløpig ikke registrert; ingen vilkårlige hotspots er lagt over romscenene.
- Historisk sluttkontroll må gjøres før aktivering. Illustrasjoner er kunstneriske fremstillinger, ikke dokumentasjon av de beskrevne hendelsene.
- Rombildene brukes ved introduksjonen; løsninger og metodetegninger må legges i solutionImage, ikke image.

Spillets aktiveringsbryter, fasit, hint, svartekster og publiserte Sanity-dokumenter endres ikke av denne PR-en. Skjemafeltene blir tilgjengelige etter Studio-deploy; eksisterende dokumenter trenger ingen migrering.
