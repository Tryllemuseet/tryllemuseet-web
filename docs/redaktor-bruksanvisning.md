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

---

## 1. Komme i gang

**Adresse:** `https://tryllemuseet.sanity.studio`

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

**Etter endring:** Publiser dokumentet. Endringer i header og footer vises umiddelbart, men siden nettsiden er statisk generert vil noen endringer kreve at Trond gjør en ny deploy.

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

Registeret over norske tryllekunstnere (over 170 registrerte). Disse vises på `/tryllehistorie/hvem-er-hvem`.

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

Dypere profiler av de mest fremstående norske tryllekunstnerne. Vises på `/norske-legender`.

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

Bibliotekskatalogen over bøker om tryllekunst. Vises på `/ressurser/boker`.

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

### 12a. Infoskjerm – konfigurasjon

**Meny:** Infoskjerm – konfigurasjon

Det finnes kun ett konfigurasjonsdokument. Hvis det ikke finnes, opprett det ved å klikke **+ Nytt dokument**.

| Felt | Standard | Merknad |
|---|---|---|
| QR-kode URL | `https://tryllemuseet.no` | URL QR-koden på skjermen peker til |
| Åpningstider (fritekst) | `Søndager kl. 13:00 – 16:00` | Vises på skjermen. Format: «Dag kl. HH:MM – HH:MM» |
| Mini-show tidspunkt | `Kl. 14:00 — presis` | Vises ved siden av Mini-show-merket |
| Pris voksen (kr) | 50 | Vises i priskortet |
| Pris barn (kr) | 20 | Vises i priskortet |
| Sitat-bytte hvert X sekund | 9 | Hvor lenge hvert sitat vises (5–60 sekunder) |

### 12b. Infoskjerm – sitater

**Meny:** Infoskjerm – sitat

Sitatene roterer nedst på skjermen. Legg til så mange du vil.

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
2. Oppdater **QR-kode URL**.
3. Klikk **Publiser**.

### Midlertidig fjerne et sitat fra skjermen

1. Gå til **Infoskjerm – sitat** og åpne sitatet.
2. Slå av **Aktiv**.
3. Klikk **Publiser**.

Sitatet forblir lagret og kan aktiveres igjen ved å slå på **Aktiv** og publisere på nytt.

---

*Spørsmål om innhold: post@tryllemuseet.no*
*Tekniske spørsmål: Trond Rein*
