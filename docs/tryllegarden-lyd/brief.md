# Brief: stemmer til Tryllegården

Du skal lage innspilte stemmer til et norsk barnespill, **Tryllegården**, et rolig og koselig julespill for barn fra omtrent 4 til 12 år. Spillet hører til Tryllemuseet på Årvoll gård i Oslo. Du får en liste med replikker (`replikker-nb.md`). Hver replikk skal leses inn flere ganger, slik at jeg kan velge den beste.

## Det viktigste: konsistens

Spillet har **fem faste stemmer**. En replikk fra Tiril skal høres ut som samme Tiril overalt, enten hun sier «Hei!» eller en lang forklaring. Velg stemmene én gang og **bruk nøyaktig samme stemmeinnstilling, samme modell og samme tempo gjennom hele leveransen**. Ikke bytt stemme underveis, selv om en annen stemme ville passet bedre til en enkelt replikk. Hvis verktøyet ditt kan lagre en stemme-id, så lagre den og oppgi den i leveransen.

| Id | Hvem | Stemme | Tempo og tone |
|---|---|---|---|
| `jente` | **Tiril**, ca. 9 år | Lys, våken, varm jentestemme. Ivrig, litt kjapp når hun blir begeistret. | Levende. Løfter stemmen på spørsmål og «Se!». |
| `gutt` | **Trym**, ca. 8 år | Litt mørkere og roligere guttestemme. Nysgjerrig, av og til skeptisk. | Noe saktere enn Tiril. Undrende på «…». |
| `nisse` | **Fjøsnissen** | Gammel, mild, litt knirkete stemme. Hvisker nesten, som om han gjemmer seg. | Langsom. Hintene hans er små hviskinger. |
| `forteller` | **Fortelleren** | Varm voksen stemme, rolig som en godnatthistorie. Verken skuespill eller nyhetsopplesing. | Jevnt og tydelig. Litt langsommere enn vanlig tale. |
| `jan` | **Jan**, tryllekunstner | Voksen mann, vennlig og trygg. Smiler i stemmen. | Naturlig samtaletempo. |

Sett én skriftlig stemmebeskrivelse per figur i leveransen (modell, stemme-id, hastighet, stabilitet), slik at jeg kan lage nye replikker senere med samme stemme.

## Språk og uttale

- **Norsk bokmål**, østnorsk uttale. Ikke svensk eller dansk melodi.
- Les teksten **ordrett**. Ikke endre, forkort eller legg til ord.
- Navn: Tiril, Trym, **Tryllegården**, Årvoll, Blakken (hesten), Loco (kakadue).
- «…» betyr en kort pause, omtrent et halvt sekund.
- «(Årvoll gård?)» sier du med et lite spørrende tonefall, som om man lurer på om dette kan være det virkelige stedet.
- «Hokus pokus», «Sim sala bim» og «Snipp snapp snute» er magiske ord. Si dem leken, ikke som skrik.
- Tall og tegn skal leses som tale («14» blir «fjorten»).
- Barn som hører på skal aldri bli redde. Ingen mørk, truende eller sarkastisk tone.

## Slik tolker du kolonnene i replikklista

| Kolonne | Betydning |
|---|---|
| `id` | Filnavnet. **Skal brukes uendret.** |
| Hvem | Hvilken av de fem stemmene som skal lese. |
| Hvor og Type | Hvor i spillet replikken står. Bruk det for å treffe tonen. |
| Type `hint 1/2` | Nissen hvisker et hint. Rolig og hjelpsom. |
| Type `feil svar` | Barnet har trykket på noe som ikke hører hjemme. Mildt, litt humoristisk, aldri belærende. |
| Type `ferdig` | Barna jubler. Størst energi i hele spillet. |
| Type `tradisjon` | Fortelleren forteller en liten julefakta. Rolig, varm. |
| Pose `jubler` | Begeistret. |

Rekkefølgen i lista er spillrekkefølgen. Replikken over er den som blir sagt rett før, så du kan ta tonen derfra.

## Leveransen

For **hver replikk, tre ulike opptak** (`v1`, `v2`, `v3`):

- `v1`: slik du mener den bør leses.
- `v2`: litt mer levende og leken.
- `v3`: litt roligere og dempet.

Stemmen er den samme i alle tre. Det er bare uttrykket som varierer.

Filene:

- Én fil per opptak: **`<id>_v1.mp3`**, **`<id>_v2.mp3`**, **`<id>_v3.mp3`**. For eksempel `14oxbmj_v1.mp3`.
- MP3, mono, 44,1 kHz, 64 kbps eller høyere. Gjerne også `wav` hvis du har det.
- Hold stillhet i starten og slutten til **0,1–0,2 sekunder**. Ingen lange pauser.
- Samme lydnivå på alle filer: omtrent −16 LUFS, og ingenting som klipper (peak under −1 dB).
- Ingen musikk, ingen bakgrunnslyd, ingen effekter. Rene stemmer.
- Legg alt i **én mappe**. Legg ved en liste (CSV) med id, hvem, stemme-id og eventuell kommentar til hver replikk.

Start med de **ti første replikkene** og send dem til meg før du lager resten. Da kan jeg bekrefte stemmene først.

## Kontroll før du leverer

- Alle ids i lista har tre opptak, ingen mangler og ingen er ekstra.
- Samme figur høres ut som samme person i alle opptak.
- Teksten stemmer ordrett med lista.
- Alle filer har samme lydnivå.
- Ingen opptak har klikk, knitring eller klippede ord.

## Etterpå (for meg, ikke for deg)

Jeg lytter og kopierer de valgte filene til `web/public/audio/tryllegarden/nb/` **uten** `_v1`-endelsen (`14oxbmj.mp3`), og kjører `node scripts/tryllegarden-audio.mjs build`. Se `README.md`.
