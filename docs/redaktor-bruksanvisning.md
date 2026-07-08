# Redaktørbruksanvisning — Tryllemuseet

Sanity Studio er administrasjonspanelet for alt innhold på tryllemuseet.no.
Denne bruksanvisningen dekker de oppgavene en redaktør utfører til daglig.

---

## Innhold

1. [Komme i gang](#1-komme-i-gang)
2. [Grunnleggende arbeidsflyt](#2-grunnleggende-arbeidsflyt)
3. [Globale innstillinger](#3-globale-innstillinger)
4. [Arrangementer](#4-arrangementer)
5. [Utstillingen — magikere og gjenstander](#5-utstillingen--magikere-og-gjenstander)
6. [Hvem er hvem — biografiregisteret](#6-hvem-er-hvem--biografiregisteret)
7. [Norske legender](#7-norske-legender)
8. [TV-opptredener](#8-tv-opptredener)
9. [Bokregisteret](#9-bokregisteret)
10. [Artefakter](#10-artefakter)
11. [Partnere og sponsorer](#11-partnere-og-sponsorer)
12. [Infoskjerm](#12-infoskjerm)
13. [Sideinnhold](#13-sideinnhold)
14. [Skjule innhold uten å slette](#14-skjule-innhold-uten-å-slette)
15. [Vanlige oppgaver — steg for steg](#15-vanlige-oppgaver--steg-for-steg)
16. [Tryllequiz](#16-tryllequiz)
17. [Historiske avisartikler](#17-historiske-avisartikler)
18. [Historiske TV-opptak](#18-historiske-tv-opptak)
19. [Tryllemuseet i media](#19-tryllemuseet-i-media)
20. [Trylleforeninger](#20-trylleforeninger)

> **Veiledning til kapittel 12 (Infoskjerm):** Seksjonene 12a–12c dekker de tre dokumenttypene som styrer skjermen. Start med 12a hvis du er ny, og legg til videoer via 12c.

---

## 1. Komme i gang

**Adresse:** `https://tryllemuseet-no.sanity.studio`

Logg inn med Google-kontoen din (samme som du bruker til museets øvrige Google-tjenester). Ta kontakt med Trond hvis du ikke har tilgang.

### Navigasjon

Menyen til venstre viser alle innholdstypene. Øverst finner du singletons (ett enkelt dokument som alltid finnes), lenger ned lister med mange dokumenter.

Klikk på et element i listen for å åpne det. Felter vises i midtkolonnen. En forhåndsvisning kan vises til høyre (avhengig av innholdstype).

---

## 2. Grunnleggende arbeidsflyt

### Lagre vs. publisere

Sanity skiller mellom *utkast* og *publisert innhold*:

- **Lagre** (Ctrl+S / Cmd+S): Lagrer et utkast som kun er synlig i Studio. Nettsiden påvirkes ikke.
- **Publiser** (grønn knapp øverst til høyre): Gjør innholdet levende på tryllemuseet.no.
- **Avpubliser**: Fjerner innholdet fra nettsiden, men beholder utkastet i Studio.
- **Forkast endringer**: Angrer ulagrede endringer og går tilbake til sist publiserte versjon.

> **Viktig:** Det er kun publiserte dokumenter som vises på nettsiden. Husk å trykke «Publiser» når du er ferdig.

### Slette et dokument

Åpne dokumentet → klikk de tre prikkene (…) øverst til høyre → velg «Delete». Bruk sletting med omhu — se [Skjule innhold](#14-skjule-innhold-uten-å-slette) for et reversibelt alternativ.

### Søke

Trykk Ctrl+K (Cmd+K på Mac) for å søke på tvers av alt innhold.

---

## 3. Globale innstillinger

**Meny:** Globale innstillinger (tannhjulikonet)

Dette er ett enkelt dokument som styrer informasjon som går igjen på hele nettsiden: header, footer, besøkssiden og kontaktsiden.

| Felt | Hva det brukes til |
|---|---|
| Museumsnavn | Vises i titler og metadata |
| Slagord | Undertittel på forsiden |
| E-post | Kontaktside og footer |
| Telefon | Kontaktside |
| Adresse (full) | Footer og kontaktside |
| Adresse (kort) | Header-stripe og kompakte visninger |
| Google Maps-lenke | Kartlenke på besøkssiden |
| Åpningstider (kort) | Header-stripe, footer, hero |
| Åpningstider (tillegg) | Tekst etter kortteksten, f.eks. «og etter avtale» |
| Åpningstider (utvidet) | Rik tekst på Besøk oss-siden |
| Bli medlem — URL | Alle «Bli medlem»-knapper |
| Vipps-nummer | Betalingsinformasjon |
| Facebook / Instagram / YouTube | Lenker i footer |
| Standard meta-beskrivelse | Google-beskrivelse for alle sider som ikke har egen |

**Etter endring:** Publiser dokumentet. Nettsiden er statisk generert og bygges på nytt automatisk hver natt — endringene vises derfor på nettsiden senest neste morgen. Haster det, kan Trond (eller den som har GitHub-tilgang) kjøre **Daily rebuild** manuelt i GitHub Actions, så er endringen ute på noen minutter. Infoskjermen er unntaket: den henter innhold direkte og oppdaterer seg selv innen 5 minutter.

---

## 4. Arrangementer

**Meny:** Arrangement

Brukes til kurs, spesialåpninger og andre datofestede hendelser. Vises på `/arrangementer` og kan fremheves på forsiden.

### Opprette et nytt arrangement

1. Klikk **+ Nytt dokument** (pensikonet øverst i listen).
2. Fyll inn feltene:

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel | Ja | Vises som overskrift |
| URL-slug | Ja | Genereres automatisk fra tittelen — klikk «Generate» |
| Dato og klokkeslett | Ja | Velg dato og klokkeslett i kalenderen |
| Målgruppe / aldersgruppe | Nei | Velg én fra listen |
| Pris | Nei | Fritekst, f.eks. «Kr 150,–» eller «Gratis» |
| Kort beskrivelse | Nei | Maks 180 tegn. Vises i listeoversikten |
| Fullstendig beskrivelse | Nei | Rik tekst med avsnitt, lenker osv. |
| Bilde / plakat | Nei | Last opp et bilde; husk alt-tekst |
| Påmeldingslenke | Nei | Ekstern URL til skjema eller Eventbrite |
| Fremhev på forsiden | Nei | Slå på for å vise arrangementet øverst på forsiden |

3. Klikk **Publiser**.

### Arkivere et passert arrangement

Passerte arrangementer vises ikke automatisk, men de blir liggende i lista. Du kan enten slette dem eller sette «Vis på nettsted» til av (se [Skjule innhold](#14-skjule-innhold-uten-å-slette)).

---

## 5. Utstillingen — magikere og gjenstander

**Meny:** Magiker / Utstillingsfelt

Disse sju dokumentene tilsvarer de sju utstillingspanelene i museet. De er fast i antall og rekkefølge (felt: «Sorteringsrekkefølge» 1–7). Ikke opprett nye — rediger de eksisterende.

Hvert dokument har tre lag med tekst som vises ulike steder:

### Barnetekst (stjernefelt — viktigst)

- **Barnetekst — veggpanel**: Enkel tekst for barn under 120 cm. Maks 300 tegn. Vises øverst på nettsiden og i museet.
- **Aktivitet — gul boks**: Oppfordring til barnet, f.eks. «Pek tryllestaven på noe magisk!». Maks 120 tegn.

### Voksentekst

- **Voksentekst — veggpanel**: 2–3 avsnitt for voksne (130–160 cm). Rik tekst.

### Detaljert tekst (mobilside / QR-destinasjon)

QR-kodene i museet peker til denne seksjonen på nettsiden.

- **Detaljert tekst — ingress**: Første avsnitt. Enkel tekst.
- **Detaljert tekst — seksjoner**: Utdypende tekst i seksjoner med overskrift og brødtekst. Legg til seksjoner ved å klikke «Add item».

### Metadata (brukes internt i Studio)

- **Navn (internt)**: Brukes i Studio-listen og URL-en.
- **Slagord (internt)**: Kort undertittel på oversiktssiden.
- **Årstall (internt)**: Vises på utstillingskortet, f.eks. «1874–1926».
- **Plakatbilde (internt)**: Bilde som vises på oversiktssiden og utstillingskortet. Husk alt-tekst.

### Kilder

Legg til lenker til Wikipedia, fagbøker o.l. under **Kilder — eksterne lenker**. Klikk «Add item», fyll inn lenketekst og URL.

---

## 6. Hvem er hvem — biografiregisteret

**Meny:** Magiker — Hvem er hvem

Registeret over norske tryllekunstnere (over 170 registrerte). Disse vises på `/tryllehistorie/magiens-hvem-er-hvem`.

### Legge til en ny person

1. Klikk **+ Nytt dokument**.
2. Fyll inn feltene:

| Felt | Påkrevd | Merknad |
|---|---|---|
| Fullt navn | Ja | Etternavn, Fornavn (Kunstnernavn) — følg eksisterende format |
| URL-slug | Ja | Genereres fra fullt navn — klikk «Generate» |
| Kunstnernavn / scenenavn | Nei | Kun kunstnernavnet isolert |
| Andre navn / pseudonymer | Nei | Legg til ett og ett ved å skrive og trykke Enter |
| Nasjonalitet | Nei | Standard er «Norsk» |
| Leveår / aktiv periode | Nei | F.eks. «1912–1995» eller «f. 1961» |
| Emneord | Nei | Velg fra listen — brukes til filtrering |
| Fremhev øverst i listen | Nei | For særlig kjente eller historisk viktige personer |
| Kortbiografi | Nei | Maks 280 tegn. Vises i listevisning |
| Fullstendig biografi | Nei | Rik tekst. Vises på detaljsiden |
| Lenker | Nei | Wikipedia, nettside, YouTube, Facebook, Instagram |
| Trenger oppdatering | Nei | Merk med ⚠️ hvis biografien er utdatert |
| Sist verifisert | Nei | Dato biografien sist ble sjekket |
| Redaksjonell merknad | Nei | Vises ikke på nettsiden — kun til intern bruk |

3. Klikk **Publiser**.

### Markere utdaterte biografier

Sett **Trenger oppdatering** til på. Dokumentet vises da med ⚠️ i lista. Bruk sorteringsvalget «Trenger oppdatering» i listemenyen for å finne alle merkede.

Husk å slå av «Trenger oppdatering» og fylle inn **Sist verifisert** etter at du har oppdatert.

---

## 7. Norske legender

**Meny:** Norsk legende

Dypere profiler av de mest fremstående norske tryllekunstnerne. Vises på `/tryllehistorie/norske-legender`.

| Felt | Merknad |
|---|---|
| Navn / tittel | Personens navn |
| URL-slug | Genereres automatisk |
| Kobling til biografi | Lenk til personens oppføring i HEH-registeret hvis den finnes |
| Ingress | Kort tekst til listevisningen |
| Brødtekst | Full tekst med avsnitt |
| Tagger | Fritekst-tagger for kategorisering |
| Hovedbilde | Portrettbilde med alt-tekst og bildetekst |
| Bildegalleri | Legg til flere bilder |
| Videoer | Legg til YouTube-lenker med tittel, type og år |
| Kilder | Eksterne lenker til Wikipedia, arkiver osv. |

---

## 8. TV-opptredener

**Meny:** TV-opptreden

Dokumenterer norske magikeres opptredener på Got Talent, Fool Us og lignende programmer.

### Obligatoriske felt

| Felt | Merknad |
|---|---|
| Magiker | Velg person fra HEH-registeret. Personen må finnes der fra før |
| URL-slug | Genereres automatisk fra magiker + program + år |
| TV-program | Velg fra lista (Norske Talenter, Fool Us, Talang osv.) |
| År | Årstall for opptredenen |
| Resultat | Velg fra lista (Vinner, Finalist, Fooled Us osv.) |

### Øvrige felt

| Felt | Merknad |
|---|---|
| Sesong / Episode | Nummer |
| Episodetittel | F.eks. for Fool Us-episoder |
| Beskrivelse | Hva magikeren gjorde på scenen. Ingen avsløring av metoder |
| Bilde | Last opp stillbilde fra opptredenen |
| Videolenke | Direktelenke til YouTube eller NRK |
| Redaksjonell merknad | Intern merknad — vises ikke på nettsiden |

> **Merk:** «Magiker»-feltet peker til **Hvem er hvem**-registeret, ikke til Utstillings-dokumentene. Personen må være registrert der først.

---

## 9. Bokregisteret

**Meny:** Bok

Bibliotekskatalogen over bøker om tryllekunst. Vises på `/bibliotek`.

### Legge til en bok

| Felt | Merknad |
|---|---|
| Tittel | Påkrevd |
| Undertittel | Valgfri |
| Utgivelsesår | Tall. Bruk «Årsnotat» for komplekse årstall |
| Forfattere | Legg til én og én. Koble til person i HEH-registeret hvis mulig |
| Beskrivelse | Norsk, kuratert beskrivelse. Legg gjerne til språknotat til slutt |
| Språk | Boken er skrevet på dette språket |
| Emneord | Velg fra listen |
| Boktype | Norsk / Internasjonal / Public domain |
| Seksjon | Gruppering på listesiden |
| Tilgjengelighet | I trykk / Gratis nedlastbar / Sjelden |
| Nedlastingslenke | Kun for fritt tilgjengelige bøker (archive.org, nb.no o.l.) |
| Kildebenevnelse | Navn på plattformen, f.eks. «Internet Archive» |
| Kildereferanse | Bibliografisk kilde for opplysningene |
| Thumbnail-URL | For archive.org: `https://archive.org/services/img/{id}` |
| Forsidebilde | Last opp for opphavsrettsbeskyttede bøker uten ekstern thumbnail |
| Forlag / ISBN / Utgave | Forlagsopplysninger |
| Fremhevet | Vis i kuraterte utvalg |
| Interne notater | Vises ikke på nettsiden |

---

## 10. Artefakter

**Meny:** Artefakt

Museets gjenstander — rekvisitter, plakater, kostymer, instrumenter osv.

### Eierforhold

Velg mellom **Museets egen samling** og **Lån fra privatperson / institusjon**. Ved lån vises ekstra felt: utlåners navn og kontaktinfo, låneperiode og avtalereferanse.

### Viktige felt

| Felt | Merknad |
|---|---|
| Navn / tittel | Påkrevd |
| Beskrivelse | Kort beskrivelse til oversikt og detaljside |
| Kategori | Rekvisitt / Plakat / Bøker / Kostyme / Instrument / Foto / Annet |
| År (tall) + Årstall-merknad | F.eks. år=1890, merknad=«ca. 1890» |
| Opprinnelse / land | F.eks. «Frankrike» |
| Materiale | F.eks. «Tre, silke, metall» |
| Dimensjoner | F.eks. «30 × 20 × 15 cm» |
| Tilstand | Utmerket / God / Middels / Dårlig / Restaurert |
| Proveniens / historikk | Hvem eide gjenstanden, dokumentasjon |
| Plassering i museet | F.eks. «Sal 2, monter A» |
| Utfyllende tekst | Lengre redaksjonell tekst |
| Fremhevet | Vis på portalsiden og forsiden |

---

## 11. Partnere og sponsorer

**Meny:** Partner / Sponsor

Vises på Om oss-siden.

| Felt | Merknad |
|---|---|
| Navn | Påkrevd |
| Logo | SVG eller PNG med transparent bakgrunn |
| Kort beskrivelse | Én til to setninger |
| Nettside | URL |
| Kategori | Velg én: Prosjektstøtte (offentlig/privat), Samarbeidspartner, Fordeler for medlemmer |
| Rekkefølge | Lavere tall vises først |

---

## 12. Infoskjerm

Infoskjermen (`tryllemuseet.no/skjerm.html`) er en separat side beregnet på Yodeck-digital signage i museet (1080×1920 portrett). Den henter innhold live fra Sanity hvert 5. minutt.

### Slik fungerer skjermen

Skjermen har to modi som velges automatisk:

**Videomodus** (aktiv når minst én aktiv video finnes i spillelisten):
Videoene spilles i løkke over hele skjermen. Mellom videoer — og med 10 sekunders «rent video»-mellomrom — sklir informasjonspaneler opp fra bunnen:
- **Arrangementer** — de tre neste kommende arrangementene fra Sanity
- **Info** — åpningstider, priser og Mini-show-tidspunkt
- **Bli med** — QR-kode til bli-med-lenken
- **Sitat** — et roterende sitat fra sitatlisten

Panelene bytter i fast syklus. Lengden på hvert panel og varigheten mellom dem styres i konfigurasjonsdokumentet.

Nede på skjermen løper alltid en **ticker** (rullende tekst) med de kommende arrangementene.

**Statisk modus** (ingen aktive videoer):
Skjermen viser et kortdisplay med museumsinformasjon og sitat-rotasjon — samme visuelle uttrykk som før videoene ble lagt til.

---

### 12a. Infoskjerm – konfigurasjon

**Meny:** Infoskjerm – konfigurasjon

Det finnes kun ett konfigurasjonsdokument. Hvis det ikke finnes, opprett det ved å klikke **+ Nytt dokument**.

| Felt | Standard | Merknad |
|---|---|---|
| QR-kode URL | `https://tryllemuseet.no` | URL QR-koden i statisk modus peker til |
| Åpningstider (fritekst) | `Søndager kl. 13:00 – 16:00` | Vises i info-panelet og statisk modus |
| Mini-show tidspunkt | `Kl. 14:00 — presis` | Vises i info-panelet |
| Pris voksen (kr) | 50 | Vises i info-panelet |
| Pris barn (kr) | 20 | Vises i info-panelet |
| Sitat-bytte hvert X sekund | 9 | Sekunder hvert sitat vises i statisk modus (5–60) |
| Bli-med QR URL | `https://tryllemuseet.no/blimedlem` | URL QR-koden i «Bli med»-panelet peker til |
| Infopanel — visningsvarighet (sekunder) | 18 | Hvor lenge hvert overlay-panel vises over videoen (8–60) |

> **Tips:** Endre «Infopanel — visningsvarighet» til 25–30 sekunder hvis du vil at besøkende skal rekke å lese arrangementsinformasjonen.

---

### 12b. Infoskjerm – sitater

**Meny:** Infoskjerm – sitat

Sitatene vises i sitat-panelet (videomodus) og som roterende tekst nederst (statisk modus). Legg til så mange du vil.

| Felt | Merknad |
|---|---|
| Sitatets tekst | Påkrevd. Maks 220 tegn |
| Kilde / person | Vises under sitatet, f.eks. «Jan Crosby» eller «Fra samlingen vår» |
| Aktiv | Kun aktive sitater vises på skjermen |
| Rekkefølge | Lavere tall vises først |

**Legge til et nytt sitat:**
1. Klikk **+ Nytt dokument** under Infoskjerm – sitat.
2. Skriv inn sitatets tekst (maks 220 tegn).
3. Fyll inn kilden.
4. Kontroller at **Aktiv** er slått på.
5. Sett et rekkefølgetall.
6. Klikk **Publiser**.

Endringen er synlig på skjermen innen 5 minutter (skjermen henter automatisk på nytt).

---

### 12c. Infoskjerm – videoer

**Meny:** Infoskjerm – video

Her administrerer du spillelisten med videoer som spilles over hele skjermen. Du kan legge til både MP4-filer og YouTube-videoer. Videoene spilles i rekkefølge og starter på nytt fra begynnelsen når alle er spilt.

> Så lenge spillelisten er tom, bruker skjermen statisk modus (kortvisning). Aktiverer du én eller flere videoer, bytter skjermen automatisk til videomodus neste gang den laster.

#### Felter

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel (internt) | Ja | Brukes bare i Studio-listen — vises ikke på skjermen |
| Video-URL | Ja | Direkte MP4-lenke **eller** YouTube-URL (f.eks. `youtube.com/watch?v=…`) |
| Start fra (sekunder) | Nei | Hopp til dette sekundet ved oppstart. 0 = fra begynnelsen |
| Stopp ved (sekunder) | Nei | Stopp avspillingen her. 0 = spill til slutten |
| Aktiv | Nei | Kun aktive videoer spilles av. Slå av for å pause en video uten å slette |
| Rekkefølge | Nei | Lavere tall spilles av først |

#### Slik legger du til en video

1. Klikk **+ Nytt dokument** under Infoskjerm – video.
2. Fyll inn en intern tittel (f.eks. «Trylleshow åpning 2024»).
3. Lim inn video-URL:
   - **MP4:** direktelenke til filen (f.eks. fra nettskyen eller museets server)
   - **YouTube:** `https://www.youtube.com/watch?v=VIDEOID`
4. Sett eventuelt **Start fra** og **Stopp ved** i sekunder hvis du bare vil vise en del av videoen. Eksempel: `startSecs=120, endSecs=300` spiller de tre minuttene fra 2:00 til 5:00.
5. Kontroller at **Aktiv** er slått på.
6. Sett **Rekkefølge** (1, 2, 3 …) for å bestemme avspillingsrekkefølgen.
7. Klikk **Publiser**.

> **Merk for YouTube-videoer:** Videoen må være offentlig eller «ikke listet» — private videoer fungerer ikke. Lyden slås av automatisk (skjermen spiller alltid stumfilmsmodus).

> **Merk for MP4-filer:** Filen må ligge på en URL som kan nås av nettleseren. Filer lastet opp direkte i Sanity fungerer ikke her — bruk en ekstern fillenke.

#### Midlertidig fjerne en video

Åpne videodokumentet → slå av **Aktiv** → klikk **Publiser**. Videoen hoppes over i spillelisten, men er lett å aktivere igjen.

#### Endre rekkefølge

Endre **Rekkefølge**-tallet på hvert dokument. Videoer med lav verdi (f.eks. 1) spilles før videoer med høy verdi (f.eks. 10). Klikk **Publiser** på alle dokumenter du endrer.

---

## 13. Sideinnhold

Disse dokumentene styrer innholdet på de faste sidene. De finnes som singletons — ett per side.

| Meny-element | Side på nettsiden |
|---|---|
| Forside | tryllemuseet.no (forsiden) |
| Barnesiden | tryllemuseet.no/barn |
| Om oss | tryllemuseet.no/om-oss |
| Besøk oss | tryllemuseet.no/besok |
| Kontakt | tryllemuseet.no/kontakt |
| Tryllehistorie | tryllemuseet.no/tryllehistorie |
| Ressurser | tryllemuseet.no/ressurser |
| Arrangement | tryllemuseet.no/arrangementer (innledning) |
| Utstilling | tryllemuseet.no/utstillingen (innledning) |
| Personvern | tryllemuseet.no/personvern |

Åpne riktig dokument, rediger tekst og bilder, og publiser. Siden disse er statisk genererte sider vil noen endringer (f.eks. forsideinnhold) kreve ny deploy av Trond.

> **Merk:** Noen sider har ikke noe Sanity-dokument og styres direkte i koden — blant annet **Tryllebutikken** (`/utstillingen/tryllebutikken`) og **Bestill tryllekunstner** (`/aktiviteter/tryllekunstnere`). Endringer der går via Trond.

---

## 14. Skjule innhold uten å slette

Alle dokument­typer har et felt **Vis på nettsted** øverst. Standard er «på» (synlig).

Slå av «Vis på nettsted» for å fjerne dokumentet fra nettsiden uten å slette det. Dokumentet forblir i Studio og kan gjøres synlig igjen når som helst.

**Bruk dette fremfor sletting når:**
- Et arrangement er avlyst, men du vil beholde informasjonen.
- En biografi er midlertidig under revisjon.
- En partner-avtale er satt på pause.

---

## 15. Vanlige oppgaver — steg for steg

### Oppdatere åpningstidene

1. Gå til **Globale innstillinger**.
2. Oppdater feltet **Åpningstider (kort)** (brukes i header og footer).
3. Oppdater **Åpningstider (utvidet)** (brukes på Besøk oss-siden).
4. Klikk **Publiser**.
5. Gå deretter til **Infoskjerm – konfigurasjon** og oppdater **Åpningstider (fritekst)** der også.
6. Klikk **Publiser**.

### Legge til et arrangement

Se [Arrangementer](#4-arrangementer) → «Opprette et nytt arrangement».

### Legge til en ny magiker i registeret

Se [Hvem er hvem](#6-hvem-er-hvem--biografiregisteret) → «Legge til en ny person».

### Registrere en TV-opptreden

1. Sjekk at magikeren finnes i **Hvem er hvem**-registeret. Opprett personen der hvis ikke.
2. Gå til **TV-opptreden** → **+ Nytt dokument**.
3. Koble til magikeren, velg program, år og resultat.
4. Fyll inn beskrivelse og videolenke.
5. Klikk **Publiser**.

### Endre inngang­sprisen på infoskjermen

1. Gå til **Infoskjerm – konfigurasjon**.
2. Oppdater **Pris voksen (kr)** og/eller **Pris barn (kr)**.
3. Klikk **Publiser**.

### Bytte QR-kode-lenken på infoskjermen

1. Gå til **Infoskjerm – konfigurasjon**.
2. Oppdater **QR-kode URL** (statisk modus) og/eller **Bli-med QR URL** (videomodus).
3. Klikk **Publiser**.

### Midlertidig fjerne et sitat fra skjermen

1. Gå til **Infoskjerm – sitat** og åpne sitatet.
2. Slå av **Aktiv**.
3. Klikk **Publiser**.

Sitatet forblir lagret og kan aktiveres igjen ved å slå på **Aktiv** og publisere på nytt.

### Legge til en video i spillelisten

Se [12c. Infoskjerm – videoer](#12c-infoskjerm--videoer) → «Slik legger du til en video».

### Midlertidig pause en video

1. Gå til **Infoskjerm – video** og åpne videoen.
2. Slå av **Aktiv**.
3. Klikk **Publiser**.

Videoen hoppes over i spillelisten til du slår **Aktiv** på igjen.

### Vise bare én bestemt del av en YouTube-video

1. Åpne videodokumentet under **Infoskjerm – video**.
2. Sett **Start fra (sekunder)** til det sekundet du vil begynne fra. Eksempel: 2 minutter og 30 sekunder → skriv `150`.
3. Sett **Stopp ved (sekunder)** til sluttsekundet. Eksempel: 5 minutter → skriv `300`.
4. Klikk **Publiser**.

### Justere tempoet på overlay-panelene

1. Gå til **Infoskjerm – konfigurasjon**.
2. Endre **Infopanel — visningsvarighet (sekunder)**. Lavere tall = raskere bytte; høyere tall gir mer lesetid.
3. Klikk **Publiser**.

### Publisere en historisk avisartikkel

Se [Historiske avisartikler](#17-historiske-avisartikler) → «Anbefalt arbeidsflyt».
Husk: sett **Publiseres på tryllemuseet.no** til ønsket dato — artikkelen dukker
opp av seg selv når datoen passeres (ved neste nattlige bygging).

### Legge inn en mediesak om museet

Se [Tryllemuseet i media](#19-tryllemuseet-i-media). Slå på **Fremhev på
forsiden** hvis saken også skal vises på forsiden.

### Koble et historisk TV-opptak til en magiker

1. Sjekk at personen finnes i **Hvem er hvem**-registeret.
2. Åpne klippet under **Historisk TV-opptak** og fyll inn **Magiker / person**.
3. Sett **Tilkoblingsstatus** til ✅ Koblet (eller 🔍 Gjennomgått).
4. Klikk **Publiser**.

---

## 16. Tryllequiz

Quizen på `/tryllequiz` styres av tre dokumenttyper i Studio:

| Type | Hva den gjør |
|---|---|
| **Quiz: Innstillinger** | Ett felles dokument med av/på-bryteren, tekster og resultatnivåer |
| **Quiz: Tema** | Temaene besøkende kan velge mellom (f.eks. «Norske legender») |
| **Quiz: Spørsmål** | Selve spørsmålene med svaralternativer |

### Slik fungerer quizen

Besøkende velger **tema** og **vanskelighetsgrad** og får en runde tilfeldige
spørsmål fra utvalget (standard 10). Etter hvert svar vises riktig svar,
forklaringen din og en eventuell «Les mer»-lenke til nettsidens eget innhold.
Til slutt får de en morsom tittel basert på poengsummen — fra «Nysgjerrig
lærling» til «Stormester i magi».

### Legge til et spørsmål

1. Klikk **+ → Quiz: Spørsmål**.
2. Skriv **Spørsmål** — kort og tydelig, gjerne med et snev av humor.
3. Legg inn **2–4 svaralternativer** og huk av **Riktig svar** på nøyaktig ett
   av dem. (Studio nekter å publisere hvis null eller flere enn ett er markert.)
   Rekkefølgen stokkes automatisk på nettsiden.
4. Skriv en **Forklaring** («Visste du at …») — den vises uansett om svaret var
   riktig eller galt, og er quizens viktigste læringsverktøy.
5. Legg gjerne inn en **Les mer-lenke** til en side på tryllemuseet.no,
   f.eks. `/tryllehistorie/norske-legender/henrik-ibsen`.
6. Velg **Vanskelighetsgrad**:
   - **Lett** — barn og nybegynnere: kjente navn, korte spørsmål
   - **Middels** — hele familien: ting en nysgjerrig besøkende plukker opp
   - **Vanskelig** — entusiaster: godbiter fra arkivet og biblioteket
7. Velg ett eller flere **Tema**. Spørsmål uten tema er bare med i «Alle tema».
8. Klikk **Publiser**.

### Legge til et tema

1. Klikk **+ → Quiz: Tema**.
2. Gi temaet navn, en emoji som ikon og en kort beskrivelse.
3. Sett **Rekkefølge** (lavest tall vises først) og klikk **Publiser**.

Tema uten publiserte spørsmål vises ikke på nettsiden, så det er trygt å
opprette tema før spørsmålene er klare.

### Aktivere quizen

1. Åpne **Quiz: Innstillinger** (opprett dokumentet hvis det ikke finnes).
2. Slå på **Quizen er aktiv** og klikk **Publiser**.
3. Quizen (og menypunktet «Tryllequiz» under Aktiviteter) dukker opp ved neste
   nattlige bygging av nettsiden — eller be teknisk ansvarlig kjøre
   **Daily rebuild** i GitHub Actions med én gang.

Så lenge bryteren er av, viser `/tryllequiz` bare en «kommer snart»-hilsen, og
quizen er skjult fra menyen. Enkeltspørsmål og tema kan når som helst skjules
med **Vis på nettsted**-bryteren, akkurat som alt annet innhold (se kapittel 14).

---

## 17. Historiske avisartikler

**Meny:** Historisk avisartikkel (📰)

Arkivet over gamle avisartikler om tryllekunst, hentet fra Nasjonalbibliotekets
aviskorpus (nb.no). Artiklene vises på `/tryllehistorie/historiske-artikler`,
og den nyeste vises i tillegg en periode på forsiden.

> **⚠️ To typer med samme navn:** Studio-menyen viser i dag *to* innslag som
> heter «Historisk avisartikkel». Bruk den som har faner øverst i dokumentet
> (**Innhold · Original kilde · Rettigheter & bilder · SoMe · Metadata**).
> Den andre er en utfaset forgjenger som ikke lenger vises på nettsiden —
> ikke opprett nye dokumenter der.

### Anbefalt arbeidsflyt

Dokumentet er delt i faner. Jobb i denne rekkefølgen:

**1. Fanen «Original kilde»** — gjør dette først:

| Felt | Merknad |
|---|---|
| Lenke til nb.no | Påkrevd. Lim inn URL-en til artikkelen på nb.no |
| 🔒 Original fulltekst | Lim inn hele den transkriberte avisteksten. **Kun internt** — vises aldri på nettsiden |
| Original liten tittel (kicker) | Teksten over hovedoverskriften, f.eks. «Vi besøker:» |
| Original stor tittel | Hovedoverskriften slik den sto i avisen |
| Original ingress | Ingressboksen, hvis avisen hadde en |
| Avis/kilde | F.eks. «Aftenposten» |
| Avisens dato | Når artikkelen sto på trykk. **Styrer 70-årsregelen for bilder** |

**2. Fanen «Innhold»** — det besøkende faktisk leser:

| Felt | Merknad |
|---|---|
| Tittel (redaksjonell) | Påkrevd. Deres egen tittel — kan avvike fra originalen |
| URL-slug | Genereres fra tittelen |
| Ingress / teaser | Påkrevd. Maks ~200 tegn, vises i kortlisten |
| Omskrevet artikkeltekst | **Deres egen frie gjengivelse i egne ord.** Dette — ikke originalteksten — er det besøkende leser |
| Museets kommentar | Kort kontekst som vises i arkivet |
| Omtalte tryllekunstnere | Koble til personer i Hvem er hvem — lenkes automatisk til profilen |

**3. Fanen «Rettigheter & bilder»:**

- Last opp **faksimiler/utsnitt** med alt-tekst og bildetekst.
- **Opphavsrettsvurdering** står normalt på *Automatisk*: bildene vises først
  når artikkelen er over 70 år gammel (regnet fra avisens dato). Vurderingen
  beregnes på nytt ved hvert nattlige bygg, så bilder «låses opp» av seg selv
  når tiden er inne. Bruk «Tving vis» / «Tving skjul» kun etter en konkret
  vurdering.

**4. Fanen «Metadata»:**

| Felt | Merknad |
|---|---|
| Publiseres på tryllemuseet.no | Påkrevd. Sett en **fremtidig dato** for planlagt publisering — artikkelen dukker opp av seg selv fra denne datoen |
| Fremhevet på forsiden i antall dager | Standard 7. Hvor lenge artikkelen vises som «siste artikkel» på forsiden. Den blir uansett liggende i arkivet permanent |
| Kategori | Artist / Forestilling / Presseomtale / Annonse / Kuriosa / Annet |
| ⚠️ Trenger verifisering | Slå på hvis kilde-URL eller dato er usikker. Fjern haken når verifisert mot nb.no |

**5. Fanen «SoMe»** (valgfri): Ferdige posttekster for Facebook/Instagram og
TikTok. Disse vises ikke på nettsiden — de er kun til å kopiere inn i Meta
Business Suite når artikkelen deles.

**6. Klikk Publiser.**

> **Viktig om opphavsrett:** Originaltekst og faksimiler fra aviser yngre enn
> 70 år skal ikke vises offentlig. Derfor vises alltid den *omskrevne* teksten,
> og bildene styres av 70-årsvurderingen. Original fulltekst-feltet er en
> intern arbeidskopi og hentes aldri ut på nettsiden.

---

## 18. Historiske TV-opptak

**Meny:** Historisk TV-opptak

Arkivet over gamle TV-klipp, vises på `/tryllehistorie/historiske-opptak`.

**Disse dokumentene opprettes automatisk:** Hver natt (kl. 06:00 UTC) synkroniseres
spillelisten fra YouTube-kanalen *Egelos videosamling*, og nye klipp legges inn
av seg selv. Du trenger normalt ikke opprette dokumenter her manuelt.

### Hva redaktøren gjør

Synkroniseringen henter bare rådata. Redaktørens jobb er å berike klippene:

| Felt | Merknad |
|---|---|
| Magiker / person | Koble til personen i Hvem er hvem-registeret |
| Kanal / kringkaster | NRK, TV 2, Filmavisen … |
| Program / kontekst | Hvilket program klippet er fra |
| Kategori | TV-opptreden, barneprogram, nyheter osv. |
| År | Settes automatisk fra YouTube, men kan overstyres — beholdes da |
| Tilkoblingsstatus | ⬜ Ikke koblet → ✅ Koblet → 🔍 Gjennomgått. Bruk denne som arbeidsliste |
| Redaksjonell merknad | Intern — vises ikke på nettsiden |

> **Ikke rediger disse feltene:** *Tittel*, *video-URL*, *miniatyrbilde* og
> *publisert på YouTube* overskrives fra YouTube ved hver nattlige synk.
> Alt annet du fyller inn beholdes.

Klipp kan skjules fra nettsiden med **Vis på nettsted**, som alt annet innhold.

---

## 19. Tryllemuseet i media

**Meny:** Tryllemuseet i media

Museets egen presseomtale — avisoppslag, TV-innslag, radio og podkast om
Tryllemuseet. Vises på `/om-oss/i-media`.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel | Ja | Oppslagets tittel |
| URL-slug | Ja | Genereres fra tittelen |
| Type | Ja | Avis / Nettavis / TV / Radio / Podkast |
| Publisert av kilden | Ja | Dato oppslaget ble publisert |
| Kilde | Ja | F.eks. «Aftenposten» |
| Ingress til kortet | Ja | Kort tekst som vises i oversikten |
| Lenke til originalartikkel | Nei | URL til kildens egen side |
| Faksimile eller pressefoto | Nei | Husk alt-tekst |
| Sitat/utdrag | Nei | Maks 2–3 setninger. Husk kildehenvisning |
| Video-URL / YouTube-ID | Nei | Vises kun når Type = TV. YouTube-ID gir innebygd avspilling |

### Fremheve en mediesak på forsiden

1. Slå på **Fremhev på forsiden**.
2. Sett eventuelt **Fremhev til og med** — saken fjernes automatisk fra
   forsiden etter denne datoen (men blir liggende på I media-siden).
   La feltet stå tomt for å fremheve inntil videre.
3. Klikk **Publiser**.

---

## 20. Trylleforeninger

**Meny:** Trylleforening

Presentasjon av norske og nordiske trylleforeninger (f.eks. Magiske Cirkel
Norge). Vises på `/utstillingen/trylleforeningene` med egen side per forening.

| Felt | Merknad |
|---|---|
| Navn | Påkrevd |
| Forkortelse | F.eks. «MCN» |
| URL-slug | Genereres fra navnet |
| Land | F.eks. «Norge» |
| Grunnlagt (år) / Oppløst (år) | Oppløst fylles kun inn for nedlagte foreninger |
| Nettside | Ekstern lenke til foreningens egne sider |
| Ingress | Maks 280 tegn — til listevisning |
| Logohistorikk | Logoer i kronologisk rekkefølge (år + logo + merknad). Nyeste vises som aktiv logo |
| Brødtekst | Rik tekst. Kan lenke direkte til personer i Hvem er hvem via «Intern lenke» |
| Sentrale skikkelser | Koble personer fra Hvem er hvem med rolle og periode, f.eks. «Formann 1952–1960» |
| Underartikler | Lengre fordypningstekster knyttet til foreningen |

---

*Spørsmål om innhold: post@tryllemuseet.no*
*Tekniske spørsmål: Trond Rein*
