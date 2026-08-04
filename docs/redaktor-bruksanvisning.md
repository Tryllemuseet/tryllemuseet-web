# Redaktørbruksanvisning — Tryllemuseet

Sanity Studio er administrasjonspanelet for alt innhold på tryllemuseet.no.
Denne bruksanvisningen dekker de oppgavene en redaktør utfører til daglig.

---

## Innhold

1. [Komme i gang](#1-komme-i-gang)
2. [Grunnleggende arbeidsflyt](#2-grunnleggende-arbeidsflyt)
3. [Globale innstillinger](#3-globale-innstillinger)
4. [Arrangementer](#4-arrangementer)
   - [4b. Triks — Lær et triks](#4b-triks--lær-et-triks)
   - [4c. Interaktive historier (tegneserier)](#4c-interaktive-historier-tegneserier)
5. [Utstillingen — Gullalderen og dybdeutstillinger](#5-utstillingen--gullalderen-og-dybdeutstillinger)
   - [5b. Tema — samle flere opplevelser om samme sak](#5b-tema--samle-flere-opplevelser-om-samme-sak)
6. [Hvem er hvem — biografiregisteret](#6-hvem-er-hvem--biografiregisteret)
   - [6b. Visste du at](#6b-visste-du-at)
   - [6c. Liten historie](#6c-liten-historie)
7. [Fordypninger](#7-fordypninger)
   - [7b. Magic Club — kvelder](#7b-magic-club--kvelder)
8. [TV-opptredener](#8-tv-opptredener)
9. [Bokregisteret](#9-bokregisteret)
   - [9b. Verdens mest… og Norden i FISM](#9b-verdens-mest-og-norden-i-fism)
   - [9c. Kilderegisteret](#9c-kilderegisteret)
10. [Artefakter](#10-artefakter)
11. [Partnere og sponsorer](#11-partnere-og-sponsorer)
12. [Infoskjerm](#12-infoskjerm)
13. [Sideinnhold](#13-sideinnhold)
    - [13b. Navigasjon (header/meny)](#13b-navigasjon-headermeny)
14. [Skjule innhold uten å slette](#14-skjule-innhold-uten-å-slette)
15. [Vanlige oppgaver — steg for steg](#15-vanlige-oppgaver--steg-for-steg)
16. [Tryllequiz](#16-tryllequiz)
17. [Historiske avisartikler](#17-historiske-avisartikler)
18. [Historiske TV-opptak](#18-historiske-tv-opptak)
19. [Tryllemuseet i media](#19-tryllemuseet-i-media)
20. [Trylleforeninger](#20-trylleforeninger)
21. [Det trettende kabinett (spillet)](#21-det-trettende-kabinett-spillet)

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
| Google Maps-lenke | «Åpne i Google Maps»-lenkene |
| Google Maps embed-URL | Selve kartet på Besøk oss-siden (se feltbeskrivelsen for hvordan du henter URL-en) |
| Åpningstider (kort) | Header-stripe, footer, hero, kontakt- og butikksiden |
| Åpningstider (tillegg) | Tekst etter kortteksten, f.eks. «og etter avtale» |
| Bli medlem — URL | Alle «Bli medlem»-knapper på hele nettsiden |
| Vipps-nummer | Vises i Tryllebutikken og i Bli medlem-seksjonen på Om oss |
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

## 4b. Triks — Lær et triks

**Meny:** Triks (Lær et triks) — under Aktiviteter

Enkle trylletriks barn kan øve på hjemme. Vises på `/barn/laer-et-triks` (oversikt) og som egen side per triks.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel | Ja | F.eks. «Den forsvinnende mynten» |
| URL-slug | Ja | Genereres fra tittelen |
| Vanskelighetsgrad | Ja | Enkel / Litt vanskeligere |
| Kort beskrivelse | Ja | Vises på kortet i oversikten, én-to setninger |
| Du trenger | Nei | Enkel liste over ting man trenger, f.eks. «En vanlig kortstokk» |
| Fremgangsmåte | Nei | Fritekst steg-for-steg som supplement til videoen. Støtter bilder inni teksten. Kan stå tom hvis videoen er nok |
| Video-lenke (YouTube) | Nei | Full YouTube-lenke. Vises personvernvennlig innebygd (youtube-nocookie.com) |
| Ekstern lenke | Nei | Bruk kun hvis trikset heller peker til en ekstern side (f.eks. en samarbeidspartner) i stedet for video |
| Hovedbilde | Nei | Vises øverst på egen side og som miniatyrbilde i oversikten |
| Bildegalleri | Nei | Flere bilder/illustrasjoner av triksets steg |
| Flere lenker | Nei | Ekstra ressurser, f.eks. lenke til rekvisitter |
| Rekkefølge | Nei | Lavere tall vises først. La stå tom hvis rekkefølgen ikke spiller noen rolle |
| Se også (relaterte lenker) | Nei | Lenketekst + intern sti (må starte med «/») til annet relatert innhold, f.eks. utstillingssiden om samme person. Vises som en liten boks nederst på siden |

### Gode råd (delt tekst for alle triks)

**Meny:** Gode råd (Lær et triks) — under Aktiviteter

Ett felles dokument styrer «Gode råd»-boksen som vises nederst på **hver** enkelt triks-side. Opprett bare ett dokument av denne typen.

| Felt | Merknad |
|---|---|
| Overskrift — til barn | Standard: «Til deg som øver» |
| Råd til barn | Liste med korte tips, ett per linje |
| Overskrift — til voksne | Standard: «Til voksne» |
| Råd til voksne | Liste med korte tips, ett per linje |

---

## 4c. Interaktive historier (tegneserier)

**Meny:** Interaktiv historie (tegneserie) — under Aktiviteter

Scenebaserte, tegneserie-lignende fortellinger for barn (f.eks. «Harry Houdini: Mannen, Myten, Legenden»). Vises på `/barn/historier` (oversikt) og som egen side per historie, med tidslinje og klikkbare punkter i bildene.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel | Ja | |
| URL-slug | Ja | Genereres fra tittelen |
| Undertittel | Nei | |
| Ingress | Nei | Introtekst øverst på siden, før første scene |
| Kilde-/kredittekst (footer) | Nei | F.eks. «Historiske foto og plakater: Library of Congress», kan inneholde lenke |
| Scener | Ja, minst 1 | Se under |
| Se også (relaterte lenker) | Nei | Lenketekst + intern sti (må starte med «/») til annet relatert innhold, f.eks. et «Lær et triks»-oppsett om samme person |

### Hver scene

Klikk «Add item» under **Scener** for å legge til en ny scene. Rekkefølgen på listen styrer rekkefølgen historien fortelles i.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Årstall | Nei | F.eks. «1899» — vises i tidslinjen |
| Kapitteltittel | Ja | F.eks. «4 · Rådet som endret alt» |
| Hovedbilde (+ alt-tekst) | Ja | Bruk fokuspunkt-verktøyet i Sanity til å styre beskjæring på ulike skjermstørrelser |
| Bildetekst | Nei | Kort tekst under hovedbildet |
| Fortellertekst | Ja, minst 1 avsnitt | Løpende tekst for scenen. Støtter lenker og bilder inni teksten |
| Dialog | Nei | Valgfrie replikker mellom personer i scenen (hvem snakker + replikk) |
| Klikkbare punkter på hovedbildet (hotspots) | Nei | Gullmerker barnet kan trykke på for å lære mer. Posisjoneres med **vannrett/loddrett posisjon i prosent** (0–100) fra henholdsvis venstre og toppen av bildet — juster og se resultatet i forhåndsvisningen. Hvert punkt har en kort merkelapp og en fakta-tekst |
| Faktaboks | Nei | Valgfri utheva boks, f.eks. «Visste du?» eller «Historisk kontekst» — egen overskrift og tekst |
| Ekstra bilder | Nei | Flere tilleggsbilder til scenen (historiske plakater, foto) |

---

## 5. Utstillingen — Gullalderen og dybdeutstillinger

**Meny:** Fordypning (samme dokumenttype som [Fordypninger](#7-fordypninger) — se der for full feltoversikt)

> **Endret 2026-07:** Gullalderens sju veggpanel-tekster og Houdini-utstillingen
> lå tidligere i to egne dokumenttyper (**Magiker / Utstillingsfelt** og
> **Utstilling / Utstillingsstasjon**). Disse er nå slått sammen til ett
> dokument for Houdini og migrert 1:1 for de sju andre — alt sammen ligger nå
> under **Fordypning**. De gamle dokumenttypene og menypunktene er fjernet
> fra Studio. Bruk alltid **Fordypning**.

Det som gjør at en Fordypning-artikkel vises under `/utstillingen` i stedet
for [`/tryllehistorie/fordypninger`](#7-fordypninger), er om ett av disse
to feltene er fylt ut:

- **Rekkefølge på vegg (internt)** — fylles ut når artikkelen faktisk har en
  fast plass på veggen i museet (Gullalderen). I motsetning til før er dette
  **ikke lenger fast til sju** — er det montert et nytt panel i museet, kan
  du legge til et nytt Fordypning-dokument og sette neste ledige tall her.
- **Stasjoner / dybder** — brukes til en fortelling i flere trinn, som
  Houdini-utstillingen (11 stasjoner). Et dokument med stasjoner havner under
  `/utstillingen` selv om det ikke har noen fysisk plassering — så bruk kun
  dette feltet for innhold som faktisk skal fremstå som en egen utstilling,
  ikke for en vanlig fordypningsartikkel med flere avsnitt (bruk **Utdypende
  tekst — seksjoner** til det, se punkt 7).

Fysiske QR-koder administreres **ikke** som et felt på Fordypning-dokumentet
— se egen dokumenttype **QR-kode** lenger ned i dette punktet.

### QR-koder — egen tabell

**Meny:** QR-kode

QR-koder er en oversiktlig tabell i Studio: hver rad er ett QR-kodedokument
med et **QR-kodenummer** og ett av to felt som sier hvor koden skal peke:

- **Peker til (Fordypning)** — søk opp og velg artikkelen koden skal lenke
  til (kun artikler med en gyldig URL-slug dukker opp som treff — du kan
  ikke skrive inn en slug/URL for hånd og risikere en skrivefeil). Bruk
  dette for QR-koder som peker til én bestemt Fordypning-artikkel — Sanity
  regner selv ut om artikkelen hører hjemme under `/utstillingen` eller
  `/tryllehistorie/fordypninger`.
- **Fast side-URL** — bruk denne i stedet hvis QR-koden skal peke til en
  fast side på nettsiden som ikke er en Fordypning-artikkel, f.eks.
  `/tryllehistorie`. Skriv inn stien med innledende skråstrek.

Fyll ut kun ett av de to feltene — Sanity varsler hvis begge eller ingen er
fylt ut. Lista i Studio viser umiddelbart hvilken URL nummeret faktisk
løser seg til, slik at du kan verifisere koblingen før du publiserer.

1. Klikk **+ Nytt dokument → QR-kode**.
2. Fyll inn **QR-kodenummer** — samme tall som er trykt/laminert på den
   fysiske QR-koden i museet. Sanity varsler hvis tallet allerede er i bruk
   av en annen QR-kode.
3. Fyll inn **enten** Peker til (Fordypning) **eller** Fast side-URL.
4. Klikk **Publiser**.

**Viktig om selve QR-koden:** koden som trykkes/lamineres skal alltid peke
til `https://tryllemuseet.no/qr/{nummer}` (f.eks. `https://tryllemuseet.no/qr/7`)
— **aldri** en direkte lenke til artikkelen (f.eks.
`/utstillingen/finn-jon`). Den korte `/qr/{nummer}`-URL-en slår opp riktig
artikkel på byggetidspunkt via QR-kode-dokumentet, slik at et fysisk
klistremerke fortsetter å virke selv om artikkelen den peker til får ny
tittel/slug eller flyttes. Skal en QR-kode peke til en annen artikkel —
endre **Peker til**-feltet på QR-kode-dokumentet, ikke nummeret.

For alle andre felt (barnetekst, voksentekst, kilder osv.) — se den fulle
feltoversikten under [7. Fordypninger](#7-fordypninger).

---

## 5b. Tema — samle flere opplevelser om samme sak

**Meny:** Tema (under Utstillingen)

> **Nytt 2026-08.** Innført fordi museets Houdini-innhold vokste til tre
> frittstående biter — veggutstillingen (Fordypning), en interaktiv
> tegneserie for barn og en quiz — uten noen måte å vise besøkende at de
> hørte sammen. Et Tema løser akkurat det problemet, og bare det: det er
> ikke en ny plass å skrive innhold, det er en samleside som peker videre
> til innhold som allerede finnes andre steder.

Bruk et Tema når noe i museet har **mer enn ett ben** — f.eks. en fysisk
utstilling som også har en tegneserie og/eller en quiz. De aller fleste
Fordypninger (enkle portrettartikler) trenger **ikke** noe Tema — de vises
som vanlig direkte under `/tryllehistorie/fordypninger`, uendret.

### Opprette et Tema

1. Klikk **+ Nytt dokument → Tema**.
2. Fyll inn **Tittel** (f.eks. «Houdini») og generer **URL-slug**.
   - **Viktig:** ikke bruk samme slug som en Fordypning temaet peker til —
     da lenker Fordypnings-kortet på temaets egen side tilbake til seg selv.
     Se eksempelet i `scripts/create-houdini-tema.mjs`: Fordypningen heter
     `houdini`, så Temaet heter i stedet `harry-houdini`.
3. Skriv en kort **intro** (vises både på temakortet på `/utstillingen` og
   øverst på temaets egen side) og last opp et **hovedbilde** hvis du har et.
4. Under **Innhold i temaet**, klikk «Add item» og velg blant Fordypning,
   Interaktiv historie, Quiz: Tema, Artefakt og Trylleforening — så mange du
   vil, i den rekkefølgen du vil vise dem.
5. Klikk **Publiser**.

Temaet dukker da opp som et eget kort på `/utstillingen`, med en egen side
på `/utstillingen/{slug}` som viser kort for alt du la til i steg 4 — hvert
kort lenker videre til innholdets egen, uendrede side (Fordypningen sin
vanlige side, tegneseriens side under `/barn/historier`, osv.).

**Merk:** Å skjule et Tema («Vis på nettsted» av) skjuler kun samlesiden —
det påvirker ikke synligheten til Fordypningen/tegneserien/quizen temaet
peker til. De styres fortsatt av sine egne «Vis på nettsted»-brytere.

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
| Videoer | Nei | Egenprodusert/promo-video knyttet direkte til personen (showreel, trailer, intervju). For arkivopptak: opprett heller et **Historisk TV-opptak**-dokument og koble det til personen der (se [18. Historiske TV-opptak](#18-historiske-tv-opptak)) — det vises da automatisk her også |
| Trenger oppdatering | Nei | Merk med ⚠️ hvis biografien er utdatert |
| Sist verifisert | Nei | Dato biografien sist ble sjekket |
| Redaksjonell merknad | Nei | Vises ikke på nettsiden — kun til intern bruk |

3. Klikk **Publiser**.

### Markere utdaterte biografier

Sett **Trenger oppdatering** til på. Dokumentet vises da med ⚠️ i lista. Bruk sorteringsvalget «Trenger oppdatering» i listemenyen for å finne alle merkede.

Husk å slå av «Trenger oppdatering» og fylle inn **Sist verifisert** etter at du har oppdatert.

---

## 6b. Visste du at

**Meny:** Visste du at — under Arkivet (Studio-tittelen på selve dokumenttypen er «Hvem skulle trodd?», samme som overskriften på nettsiden)

Korte «visste du at»-portretter av kjente personer med et overraskende forhold til magien (vitenskap, politikk, sport, kultur). Vises på `/tryllehistorie/hvem-skulle-trodd` med kategorifilter, og som egen side per oppføring.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Navn | Ja | |
| URL-slug | Ja | Genereres fra navnet |
| Kategori | Ja | Vitenskap / Politikk & samfunn / Sport / Kultur & underholdning |
| Krok (korttekst) | Ja | Kort «visste du at»-tekst til spotlight-kortet, 2–3 setninger |
| Brødtekst | Nei | Valgfri, lengre artikkeltekst til egen side. Kan stå tom hvis «Koblet til» peker på en side som allerede har historien |
| Bilde | Nei | |
| Koblet til | Nei | Valgfri kobling til en Fordypning eller en biografi (Hvem er hvem) — lenkes til fra egen side som «Les hele historien» |
| Kilder | Nei | |
| Fremhev på forsiden / Rekkefølge på forsiden | Nei | Se merknad under |

> **Merk:** «Fremhev på forsiden» har for øyeblikket ingen synlig effekt — forsiden fikk et nytt design uten en egen «Hvem skulle trodd?»-seksjon, men feltet ligger fortsatt i skjemaet i tilfelle seksjonen kommer tilbake. Oppføringene er uansett fullt browsable i sitt eget arkiv uansett hva bryteren står på.

---

## 6c. Liten historie

**Meny:** Historie — under Arkivet (Studio-tittel: «Liten historie»)

Korte, frittstående anekdoter fra tryllekunstens historie, publisert omtrent ukentlig — samme mekanikk som [Historiske avisartikler](#17-historiske-avisartikler). Vises i arkivet på `/tryllehistorie/historier`, og den nyeste dukker automatisk opp som «Ukens historie» i «Historie og aktuelt»-seksjonen på forsiden.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel | Ja | |
| URL-slug | Ja | Genereres fra tittelen |
| Ingress / teaser | Ja | Vises i kortlisten og på forsiden. Maks ~200 tegn |
| Historien | Ja | Selve teksten. Støtter lenker, interne lenker til Hvem er hvem og bilder i teksten |
| Bilde | Nei | Vises i kortlisten, på forsiden og på historiens egen side |
| Kildenote | Nei | Fritekst-kildenote vist under historien |
| Kildelenker | Nei | Valgfrie lenker til kilder på nett |
| Omtalte tryllekunstnere | Nei | Koble til personer i Hvem er hvem — lenkes automatisk til profilen |
| Publiseres på tryllemuseet.no | Ja | Sett en **fremtidig dato** — historien dukker opp av seg selv fra denne datoen (ved neste nattlige bygging), akkurat som avisartiklene |
| Fremhevet på forsiden i antall dager | Nei | Standard 7. Hvor lenge historien vises som «Ukens historie» på forsiden. Forblir uansett i arkivet permanent |
| SoMe-tekst | Nei | Ferdig posttekst inkl. emneknagger til Instagram/Facebook — kopieres til Meta Business Suite, vises ikke på nettsiden |

> **Tips:** Skriv gjerne flere historier på forskudd med én publiseringsdato per uke, så bygger arkivet seg opp automatisk.

---

## 7. Fordypninger

**Meny:** Fordypning

> **Omdøpt 2026-07** fra «Norske legender» — arkivet dekker nå både norske og
> internasjonale tryllekunstnere, foreninger og temaer, ikke bare norske.
> Vises på `/tryllehistorie/fordypninger` (med mindre feltene under gjør at
> artikkelen i stedet havner under `/utstillingen` — se
> [5. Utstillingen](#5-utstillingen--gullalderen-og-dybdeutstillinger)).

Dette er museets generelle dokumenttype for dybdeartikler — alt fra korte
portretter (Arnardo, Egelo, Jan Crosby …) til Gullalderens veggpanel-tekster
og flerstasjons-utstillinger som Houdini. Du velger selv hvor «dyp» artikkelen
skal være ved å fylle ut flere eller færre av feltene under.

### Identitet

| Felt | Påkrevd | Merknad |
|---|---|---|
| Navn / tittel | Ja | Vises som overskrift |
| URL-slug | Ja | Genereres automatisk fra tittel |
| Kobling til biografi | Nei | Lenk til personens oppføring i HEH-registeret hvis den finnes |
| Slagord / undertittel | Nei | Kort undertittel til kortvisning, maks 60 tegn. Uavhengig av biografi-koblingen — bruk dette for artikler som ikke handler om én person, f.eks. «Plasma-kulen» |
| Årstall | Nei | F.eks. «1874–1926» eller «2006» |

### Plassering (kun ved fysisk tilknytning til museet)

Se [5. Utstillingen](#5-utstillingen--gullalderen-og-dybdeutstillinger) for
når disse skal fylles ut. La dem stå tomme for en vanlig fordypningsartikkel.

| Felt | Merknad |
|---|---|
| Rekkefølge på vegg (internt) | Kun ved fast fysisk plassering, f.eks. i Gullalderen |

QR-kode håndteres ikke som et felt her — se egen **QR-kode**-dokumenttype
under [5. Utstillingen](#5-utstillingen--gullalderen-og-dybdeutstillinger).

### Innhold — velg det som passer artikkelen

Du trenger ikke fylle ut alle feltene under. To vanlige mønstre:

- **Enkel portrettartikkel** (de fleste fordypninger): bruk kun **Brødtekst**
  — én løpende artikkel, slik de fleste eksisterende portrettene er skrevet.
- **Museums-/utstillingsstil** (dual-audience, som Gullalderen og Houdini):
  bruk **Barnetekst**, **Voksentekst — veggpanel** og evt. **Utdypende
  tekst — seksjoner** i stedet for Brødtekst.

Ikke bland begge mønstrene i samme artikkel uten grunn — velg ett.

| Felt | Merknad |
|---|---|
| ⭐ Barnetekst — veggpanel | Enkel tekst for barn, maks 300 tegn |
| ⭐ Aktivitet — gul boks | Oppfordring til barnet, maks 120 tegn |
| Voksentekst — veggpanel (kort) | Rik tekst, 2–3 korte avsnitt |
| Ingress | Kort tekst til listevisningen (kortene på oversiktssiden) |
| Utdypende tekst — ingress | Første avsnitt i en seksjonsdelt utdyping |
| Utdypende tekst — seksjoner | Del utdypingen i flere seksjoner med egen overskrift — «Add item» for hver seksjon |
| Brødtekst | Fri, løpende artikkeltekst — det vanlige valget for en portrettartikkel. Støtter bilder og lenker (eksterne og interne, til Hvem er hvem) satt inn midt i teksten, ikke bare i Bildegalleriet nederst |
| Tagger | Fritekst — brukes til gruppering/filtrering på oversiktssiden. Fritt valgte ord, f.eks. «kvinner-i-norsk-trylling», «jubileum», «foreningshistorie» |
| Se også (relaterte lenker) | Valgfritt: lenketekst + intern sti (må starte med «/») til annet relatert innhold andre steder på nettsiden, f.eks. en barnehistorie eller et «Lær et triks»-oppsett om samme person. Vises som en liten boks nederst på siden |

### Stasjoner / dybder (valgfritt, sjeldent brukt)

Se [5. Utstillingen](#5-utstillingen--gullalderen-og-dybdeutstillinger) —
en artikkel med stasjoner fylt ut havner alltid under `/utstillingen`, ikke
her. Bruk kun dette feltet for en reell flerdels utstillingsopplevelse (som
Houdini); bruk **Utdypende tekst — seksjoner** over for en vanlig
inndelt artikkel.

### Media og kilder

| Felt | Merknad |
|---|---|
| Hovedbilde | Portrettbilde med alt-tekst og bildetekst |
| Bildegalleri | Legg til flere bilder |
| Videoer | YouTube-lenker med tittel, type og år |
| Kilder | Eksterne lenker til Wikipedia, arkiver osv. |

---

## 7b. Magic Club — kvelder

**Meny:** Magic Club — kveld ⚠️ *se merknad om menyplassering nedenfor*

Dokumenterer enkeltkvelder av **Magic Club**, Davidos faste magikerkveld i Oslo (2015–). Vises på `/tryllehistorie/fordypninger/magic-club` (oversikt) og som egen side per kveld. Selve samleartikkelen om konseptet er et vanlig **Fordypning**-dokument (se [7. Fordypninger](#7-fordypninger)) — «Magic Club — kveld» brukes kun til de enkelte kveldene.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Dato | Ja | |
| Spillested | Ja | |
| URL-slug | Ja | Skrives inn manuelt, f.eks. «2019-10-17» — pass på at ikke to kvelder får samme slug |
| Konsept-artikkel | Nei | Kobling tilbake til Fordypning-artikkelen om selve Magic Club-konseptet |
| Plakat | Nei | |
| Gjestestjerner | Nei | Internasjonale eller spesielle gjester denne kvelden — navn + kort beskrivelse, f.eks. «Livin' Legend» |
| Norsk lineup | Nei | Navn, med valgfri kobling til personens biografi hvis den finnes i Hvem er hvem |
| Øvrige innslag | Nei | F.eks. dansere eller musikalske innslag — kategori + navn |
| Notater | Nei | Hva gjorde akkurat denne kvelden spesiell, hvis kjent |
| Kilde-URL | Nei | F.eks. lenke til Facebook-posten informasjonen er hentet fra |

> ⚠️ **Manglende menypunkt:** Denne dokumenttypen finnes i Studio, men er (ennå) ikke lagt inn i venstremenyens mappestruktur — trykk **Ctrl+K** (Cmd+K på Mac) og søk etter «Magic Club», eller bruk **+ Nytt dokument** øverst i Studio, for å opprette eller finne en kveld. Si fra til Trond hvis du vil ha den lagt til som egen menylenke under Fordypninger.

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

Bibliotekskatalogen over bøker om tryllekunst. Vises på `/ressurser/bibliotek` (kortadressen `/bibliotek` videresender dit).

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

## 9b. Verdens mest… og Norden i FISM

To dokumenttyper med korte, kategoriserte fakta-/rekordhistorier fra tryllekunstens verden, hver på sin egen side.

### Verdensrekord-triks

**Meny:** Verdensrekord-triks — under Arkivet (Studio-tittel: «Verdens mest… (oppføring)»)

Vises gruppert på `/tryllehistorie/verdens-mest`.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Kategori | Ja | 💀 Verdens farligste / 🕰️ Verdens eldste / 🇳🇴 Verdens mest norske bidrag / 🔁 Verdens mest kopierte / 💰 Verdens dyreste illusjoner / ⚡ Verdens mest omdiskuterte |
| Tittel | Ja | F.eks. «Kulefangst-trikset», «Davidos Guinness-rekord» |
| Teaser | Ja | Kort, dramatisk — vises i oversikten |
| Full historie | Ja | Rik tekst |
| Relatert person i registeret | Nei | Valgfri kobling til en biografi, f.eks. Davido eller Finn Jon |
| Kilder | Nei | Fritekst, én kilde per linje (f.eks. «Wikipedia — Bullet catch» eller en URL) |
| Trenger verifisering før publisering | Nei | Skru på ⚠️ hvis en påstand i teksten ikke er 100 % bekreftet ennå |
| Rekkefølge innen kategori | Nei | |

### Konkurranseresultat

**Meny:** Konkurranseresultat — under Arkivet

Nordiske pallplasseringer og andre konkurranseresultater. Vises på `/tryllehistorie/norden-i-fism`: FISM-resultater i én tabell øverst, øvrige (Nordisk/NM/Annet) i en egen tabell under.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Navn | Ja | Fritekst — brukes alltid til visning, selv om Person i registeret er satt |
| Person i registeret | Nei | Sett hvis personen finnes i Hvem er hvem — navnet lenkes da til profilen |
| Land | Ja | Norge / Sverige / Danmark / Finland / Island |
| Konkurranse | Ja | FISM (VM) / Nordisk mesterskap / Norgesmesterskap (NM) / Annet |
| År | Ja | |
| Sted | Nei | F.eks. «Madrid», «Trondheim» |
| Kategori/disiplin | Nei | Fritekst, f.eks. «Manipulasjon», «Korttriks», «Scenemagi» |
| Resultat/plassering | Ja | F.eks. «1. plass (Verdensmester)», «2. plass», «Grand Prix» |
| Kilde | Nei | F.eks. «fism.org/championships/winners» |

---

## 9c. Kilderegisteret

**Meny:** Kilde — under Arkivet

En gjenbrukbar liste over kilder. I stedet for å skrive den samme kilden om og om igjen, kan du opprette den her én gang og deretter **koble til den** fra «Kilder»-feltet på de fleste andre dokumenttyper (Fordypning, Trylleforening, Triks, Liten historie, Visste du at m.fl.) — velg kilden fra listen i stedet for å skrive fritekst.

| Felt | Påkrevd | Merknad |
|---|---|---|
| Tittel / kildebeskrivelse | Ja | F.eks. «Magiens Hvem er Hvem — Terje Nordheim (2005)» eller «Store norske leksikon» |
| Kildetype | Nei | Bok / Nettside / leksikon / Avisartikkel / Arkiv / dokument / Intervju / Annet |
| Forfatter | Nei | |
| Utgivelses-/publiseringsår | Nei | |
| URL | Nei | La stå tom for bøker uten nettlenke |
| Kobling til bok i bokregisteret | Nei | Bruk hvis kilden også finnes som eget dokument i [Bokregisteret](#9-bokregisteret) |
| Interne notater | Nei | Vises ikke på nettsiden |

> **Merk:** Kilder-feltet på **Hvem er hvem**-biografier er unntaket — det er alltid en direkte liste av kilde-koblinger til denne registertypen, ikke fritekst med et valgfritt kobling-alternativ. Se [6. Hvem er hvem](#6-hvem-er-hvem--biografiregisteret).

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
| Forside | tryllemuseet.no (forsiden) — se detaljert oversikt rett under |
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

> **Automatiske antall:** På Tryllehistorie-siden telles tallene i arkivkortene («… biografier», «… opptredener» osv.) automatisk hver gang nettsiden bygges. Badge-feltet i Sanity trenger bare fylles ut for kort som ikke er arkivsider — f.eks. «Kommer snart».

> **Ett felles hjem for kontaktinfo:** E-post, Vipps-nummer og «Bli medlem»-lenken hentes alltid fra **Globale innstillinger** — også i faktaboksen og Bli medlem-seksjonen på Om oss-siden. Endrer du dem der, endres de overalt.

### 13a. Forsiden — seksjon for seksjon

**Meny:** Forside (finnes kun ett dokument — åpne det, ikke opprett nytt)

Forsiden er bygget opp av flere uavhengige seksjoner i samme dokument. Du
trenger bare åpne dette ene dokumentet, rulle ned til riktig seksjon, endre
og publisere.

| Seksjon | Felt | Merknad |
|---|---|---|
| **Hero** | Overskrift, Kursiv del av overskrift | De to delene av hovedoverskriften — «kursiv del» vises fremhevet/skrå |
| | Ingress | Teksten under overskriften |
| | Knapp 1 / Knapp 2 — tekst og URL | De to knappene i heroen, f.eks. «Planlegg besøket» → `/besok` |
| | Bakgrunnsbilde | Bildet bak heroen |
| **Info-badges** | Tekst (maks 3) | De tre korte faktaboksene rett under heroen, f.eks. «7 utstillingsfelt» |
| **Fremhevet innhold** | Tidsperiode-label, Overskrift | F.eks. «Gullalderen 1845–1930». Tidsperiode-label er valgfri — la stå tom hvis det du fremhever ikke er tidsbundet |
| | Håndplukket innhold (maks 5) | Se under |
| **Barn & unge-seksjon** | Overskrift, Ingress, Aktiviteter/features, Sitater | Fritekst-liste og sitater med emoji og kilde |
| **Medlemskap-seksjon** | Overskrift, Tekst, Knapp — tekst | Knappens URL hentes alltid fra **Globale innstillinger** → Bli medlem-lenke, ikke herfra |
| **Om museet-seksjon** | Overskrift, Tekst, Sitat, Sitatets kilde | |
| **Kurs-seksjon** | Overskrift, Ingress, Detaljer (kulepunkter), Pris, Prislabel, Fondsbadge, Knapp — tekst og URL | |
| **Kurssitat** | Sitatekst, Kilde | Eget sitat knyttet til kurs-seksjonen |

> **Oppdatert 2026-07 — «Håndplukket innhold» er ikke lenger låst til
> Gullalderen:** Feltet lar deg nå velge fritt blant **Fordypninger**
> (Gullalderen-panelene, Houdini-stil dybdeartikler og vanlige
> portrettartikler), **historiske avisartikler** og **historiske
> TV-opptak** — i hvilken som helst blanding, opptil 5 stykker. Er feltet
> tomt, vises Gullalderen-panelene automatisk som før (samme
> reserveløsning som tidligere, bare hentet fra riktig kilde nå).
>
> For en avisartikkel lenker kortet direkte inn i lese-modalen på
> `/tryllehistorie/historiske-artikler` — ingen egen side trengs for det.

> **Krever ny deploy:** Forsiden er en statisk generert side. Endringer du
> publiserer i Sanity vises ikke på tryllemuseet.no før neste bygging (enten
> den daglige kl. 05:30, eller en manuell «Daily rebuild» trigget av Trond via
> GitHub Actions). Det er normalt — ikke et tegn på at noe gikk galt.

> **Om «Hero»-feltet og «Info-badges»:** Skjemaet har fortsatt et eget «Hero»-objekt
> (Overskrift, Kursiv del, Ingress, Knapp 1/2, Bakgrunnsbilde) og «Info-badges»
> fra en tidligere forsideversjon. Disse leses ikke lenger av forsiden — den
> bruker i dag **Hero-bannere (karusell i toppen)** i stedet, se tabellen over.
> Ikke bruk tid på å redigere «Hero»/«Info-badges»; de har ingen synlig effekt
> akkurat nå.

---

## 13b. Navigasjon (header/meny)

**Meny:** Sitenavigasjon (nederst i Studio-menyen, ved siden av Globale innstillinger)

Ett felles dokument styrer hele hovedmenyen — header (desktop-dropdown), mobilmeny og footerens «Utforsk»-liste leses alle fra samme sted. Opprett bare ett dokument av denne typen.

> ⚠️ **Vær forsiktig:** Dette er en strukturell innstilling som påvirker navigasjonen på hele nettsiden for alle besøkende. Test grundig og spør Trond ved usikkerhet før du gjør større endringer.

Under **Hovedområder** legger du til ett element per toppnivå-punkt i menyen (rekkefølgen i lista styrer rekkefølgen i menyen):

| Felt | Merknad |
|---|---|
| Tittel | Menyteksten |
| Lenke | |
| Stier som markerer dette som aktivt | Alle stier som skal gi gyllen uthevning i menyen når man er på en underside — f.eks. matcher «Aktiviteter» også `/barn` og `/tryllequiz` |
| Plassering i header (desktop) | Venstre / Høyre — styrer kun hvilken side av logoen punktet vises på ved desktop-bredde. Mobilmeny og footer følger uansett rekkefølgen i lista |
| Synlig | Av: skjuler hele hovedområdet (inkl. underområder) fra header, mobilmeny og footer uten å slette det |
| Underområder | Fritt antall — se under. La stå tom hvis hovedområdet ikke skal ha noen nedtrekksmeny |

Hvert **underområde** (nedtrekksmeny-punkt) har:

| Felt | Merknad |
|---|---|
| Tittel | |
| Lenke | Relativ sti, f.eks. `/utstillingen/artefakter` |
| Synlig | Av: skjuler underpunktet uten å slette det |
| Koblet til funksjonsbryter | Kun for Tryllequiz og Det trettende kabinett — punktet vises da bare når **både** dette er «Synlig» **og** hovedbryteren i quizConfig/gameConfig er aktiv (se [16. Tryllequiz](#16-tryllequiz) og [21. Det trettende kabinett](#21-det-trettende-kabinett-spillet)) |

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

Åpningstidene finnes tre steder — husk alle:

1. **Globale innstillinger** → **Åpningstider (kort)** — den korte teksten som brukes i header, footer, forside, kontakt- og butikksiden. Klikk **Publiser**.
2. **Besøk oss**-dokumentet → **Åpningstider**-tabellen (dag for dag). Klikk **Publiser**.
3. **Infoskjerm – konfigurasjon** → **Åpningstider (fritekst)** — skjermen i museet. Klikk **Publiser**.

### Legge til et arrangement

Se [Arrangementer](#4-arrangementer) → «Opprette et nytt arrangement».

### Legge til en ny magiker i registeret

Se [Hvem er hvem](#6-hvem-er-hvem--biografiregisteret) → «Legge til en ny person».

### Legge til en fordypningsartikkel

1. Klikk **+ → Fordypning**.
2. Skriv **Navn / tittel**, generer slug.
3. Skriv artikkelen — normalt holder det med **Brødtekst**. Se
   [7. Fordypninger](#7-fordypninger) for når du heller bør bruke
   barnetekst/voksentekst/seksjoner-mønsteret.
   - Vil du ha bilder *inni* teksten (ikke bare i galleriet nederst): plasser
     markøren der bildet skal stå og bruk «+»-knappen i verktøylinjen til
     Brødtekst-feltet, samme sted som Fet/Kursiv.
   - Vil du lenke ut fra teksten: merk ordene, klikk lenke-ikonet i
     verktøylinjen og lim inn URL-en (eller velg «Intern lenke» for å lenke
     til en person i Hvem er hvem).
4. Har du mange bilder som ikke hører hjemme inni teksten — bruk
   **Bildegalleri** i stedet, det vises samlet under artikkelen.
5. Legg gjerne på noen **Tagger** hvis artikkelen hører til et tema
   (f.eks. «kvinner-i-norsk-trylling») — brukes til filtrering på
   `/tryllehistorie/fordypninger`.
6. La **Rekkefølge på vegg** og **Stasjoner** stå tomme med mindre artikkelen
   faktisk skal vises under `/utstillingen` — se
   [5. Utstillingen](#5-utstillingen--gullalderen-og-dybdeutstillinger). Skal
   artikkelen ha en fysisk QR-kode, opprett et eget **QR-kode**-dokument
   som peker til den (samme sted).
7. Klikk **Publiser**.

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

### Legge til et nytt triks eller en ny barnehistorie

Se [4b. Triks — Lær et triks](#4b-triks--lær-et-triks) eller
[4c. Interaktive historier](#4c-interaktive-historier-tegneserier). Husk
**Rekkefølge**-feltet på triks hvis du vil styre hvor det havner i lista.

### Publisere en «Liten historie»

Se [6c. Liten historie](#6c-liten-historie). Husk: sett **Publiseres på
tryllemuseet.no** til ønsket dato, akkurat som avisartiklene — historien
dukker opp av seg selv når datoen passeres.

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
   f.eks. `/tryllehistorie/fordypninger/henrik-ibsen`.
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

### Legge til flere YouTube-kanaler i synken

**Meny:** YouTube-kilde (synk) — under Arkivet

Synk-jobben henter fra én eller flere kanaler, styrt av egne dokumenter her — ikke av kode. For å abonnere på en ny kanal:

1. Klikk **+ Nytt dokument** under YouTube-kilde (synk).
2. Fyll inn **Visningsnavn** (brukt internt i Studio og i synk-loggen).
3. Fyll inn **YouTube kanal-ID** — den stabile ID-en som starter med «UC…», *ikke* @handle. Finnes via kanalens «Om»-side → «Del kanal» → «Kopier kanal-ID».
4. Fyll inn **Kanal-handle** (f.eks. «@Egelosvideosamling») og **Kildetekst** — teksten som settes i «Kilde / samling»-feltet på nye opptak fra denne kanalen.
5. Kontroller at **Aktiv i synk** er på, og klikk **Publiser**.

Slå av **Aktiv i synk** for å midlertidig hoppe over en kanal uten å slette allerede importerte opptak.

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
| Underartikler | Lengre fordypningstekster knyttet til foreningen — tittel, egen URL-slug (valgfri), ingress, brødtekst, tilknyttede personer og egne kilder |
| Bildegalleri | Flere bilder, hvert med alt-tekst, bildetekst og valgfritt årstall |
| Kilder | Lenker til Wikipedia, arkiver, nasjonalbiblioteket osv. |
| Interne notater | Vises ikke på nettsiden |

---

## 21. Det trettende kabinett (spillet)

**Meny:** Kabinettet: Innstillinger / Kabinettet: Rom

Historiespillet på `/det-trettende-kabinett`. Selve gåtelogikken (puslespill,
verset på Markedsplassen, ordlisten på Minnet som dikter osv.) ligger i koden
og kan ikke endres i Sanity. Det redaktørene styrer er **teksten spilleren
leser** i hvert rom, samt valgfrie bilder. Det er trygt å redigere fritt her
uten å ødelegge noen gåte.

### Kabinettet: Innstillinger (finnes kun ett dokument)

| Felt | Merknad |
|---|---|
| Spillet er aktivt | Hovedbryter. Av som standard — spillet vises som «kommer snart» og er skjult fra menyen |
| Tittel / Introtekst | Vises øverst på spillsiden |
| «Kommer snart»-tittel / -tekst | Vises så lenge spillet ikke er aktivt |
| **Engelsk**-seksjonen | Samme felt på engelsk, pluss **Vis engelsk språkvalg i spillet**. Denne bryteren viser en «In English»-knapp i spillet — slå den på først når det engelske innholdet er kvalitetssikret |

### Kabinettet: Rom (ett dokument per rom — 27 stykker)

Hvert dokument overstyrer standardteksten som ellers ligger i koden for ett
navngitt rom. Et rom uten dokument (eller med tomme felt) viser bare
standardteksten — helt trygt.

| Felt | Merknad |
|---|---|
| Vis på nettsted | Av: spillet bruker kodens standardtekst i stedet |
| Rom | Hvilket rom dokumentet gjelder. Opprett maks ett dokument per rom |
| Romtittel / Introtekst | Overstyrer tittel og Direktørens introduksjon til rommet |
| Introtekst med formatering | **Nytt.** Rik tekst med lenker og innskutte bilder i selve teksten. Brukes i stedet for vanlig Introtekst når den er fylt ut |
| Rombilde | **Nytt.** Valgfritt stemningsbilde vist under rommets intro — f.eks. en gjenstand eller plakat fra samlingen. Husk alt-tekst |
| «Visste du at …»-fakta | Historiske fakta som vises når rommet er løst. Hvert faktum kan ha egen **tekst**, valgfritt **bilde** (nytt) og valgfri **lenke** + lenketekst |
| **Engelsk**-seksjonen | Samme felt på engelsk (tittel, intro, rik intro) — og hvert faktum har egne engelske tekst-/lenkefelt |

### Viktig: navnet er «begerspillet», ikke «begre og kuler»

Kodens standardtekst kaller oldtidstrikset i Sandrommet «begerspillet»
(samme betegnelse som resten av nettsiden bruker). To rom-dokumenter i Sanity
ble opprettet før dette navnebyttet og overstyrer fortsatt med den gamle
formuleringen «begre og kuler»:

- **Sandrommet** — introtekst, første faktum og lenketeksten
- **Gatehjørnet** — det første faktumet

Rett teksten i disse to dokumentene (bytt til «begerspillet»), eller slå av
**Vis på nettsted** på dem så kodens oppdaterte tekst vises i stedet.

### Aktivere spillet

1. Rediger rom-tekster og last opp bilder etter behov (valgfritt — spillet
   fungerer fint uten).
2. Kvalitetssikre historiske fakta.
3. Åpne **Kabinettet: Innstillinger** og slå på **Spillet er aktivt**.
4. Vent på nattlig bygging, eller be teknisk ansvarlig kjøre **Daily
   rebuild** i GitHub Actions. Spillet og menypunktet dukker opp sammen.

Slå på **Vis engelsk språkvalg i spillet** samme sted når det engelske
innholdet er klart for besøkende.

---

*Spørsmål om innhold: post@tryllemuseet.no*
*Tekniske spørsmål: Trond Rein*
