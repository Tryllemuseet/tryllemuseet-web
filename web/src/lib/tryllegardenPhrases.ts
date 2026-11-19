// src/lib/tryllegardenPhrases.ts
//
// Fixed sentences the game says during the mini-games and on the map, in one
// place so scripts/tryllegarden-audio.mjs can list them for recording. The
// page speaks them through ph(key); edits here change both screen and voice
// (a changed sentence simply falls back to speech synthesis until re-recorded).

export const PHRASES = {
  seDerDetLyser: ["Se der det lyser!", "Look where it glows!"],
  denHorerIkkeHjemmeHer: ["Den hører ikke hjemme her!", "That one does not belong here!"],
  ikkeHeltEnnaHvaMa: ["Ikke helt ennå. Hva må skje før det?", "Not quite yet. What has to happen before that?"],
  ferdigAltIRiktigRekkefolge: ["Ferdig! Alt i riktig rekkefølge.", "Done! Everything in the right order."],
  riktigHvaKommerSa: ["Riktig! Hva kommer så?", "Right! What comes next?"],
  seNoyeEtter: ["Se nøye etter!", "Watch closely!"],
  dinTurDenneGangenBaklengs: ["Din tur! Denne gangen baklengs: den siste fuglen først.", "Your turn! Backwards this time: the last bird first."],
  dinTurTrykkPaFuglene: ["Din tur! Trykk på fuglene i samme rekkefølge.", "Your turn! Tap the birds in the same order."],
  oiDetBleIkkeHelt: ["Oi, det ble ikke helt riktig. Se en gang til!", "Oops, not quite. Watch once more!"],
  duHusketAlleSammen: ["Du husket alle sammen!", "You remembered them all!"],
  flottEnRundeTilLitt: ["Flott! Én runde til, litt lengre.", "Lovely! One more round, a little longer."],
  riktigDuFulgteAlleFlettene: ["Riktig! Du fulgte alle flettene.", "Right! You followed every braid."],
  riktigEnFletteTil: ["Riktig! Én flette til.", "Right! One more braid."],
  hvilkenKakeManglerDerDet: ["Hvilken kake mangler der det lyser?", "Which biscuit is missing where it glows?"],
  ikkeDenSiMonsteretHoyt: ["Ikke den. Si mønsteret høyt fra starten!", "Not that one. Say the pattern aloud from the start!"],
  alleKakeneErPaPlass: ["Alle kakene er på plass!", "Every biscuit is in place!"],
  riktigEnNyRad: ["Riktig! En ny rad.", "Right! A new row."],
  kurvenErFerdigFlettet: ["Kurven er ferdig flettet!", "The basket is woven!"],
  heltLiktNaEnLitt: ["Helt likt! Nå en litt større kurv.", "Just the same! Now a slightly bigger basket."],
  hysjNissenListerSegInn: ["Hysj … nissen lister seg inn.", "Shh … the nisse is tiptoeing in."],
  slikStoDetFor: ["Slik sto det før.", "This is how it was."],
  hvaHarNissenByttetUt: ["Hva har nissen byttet ut? Trykk på det.", "What did the nisse swap? Tap it."],
  riktigDegLurerHanIkke: ["Riktig! Deg lurer han ikke.", "Right! He cannot fool you."],
  riktigEnGangTilMed: ["Riktig! Én gang til, med flere ting.", "Right! Once more, with more things."],
  denLyserAllerede: ["Den lyser allerede.", "That one is already lit."],
  alleLykteneLyser: ["Alle lyktene lyser!", "All the lanterns are lit!"],
  alleLyserNissenTullerTil: ["Alle lyser! Nissen tuller til lyktene en gang til.", "All lit! The nisse muddles the lanterns once more."],
  herManglerDetLedetrader: ["Her mangler det ledetråder.", "There are no clues here."],
  ikkeDenLesLedetradenEn: ["Ikke den. Les ledetråden en gang til!", "Not that one. Read the clue once more!"],
  riktigDuFantDemAlle: ["Riktig! Du fant dem alle.", "Right! You found them all."],
  riktigHerKommerEnNy: ["Riktig! Her kommer en ny ledetråd.", "Right! Here comes a new clue."],
  ikkeHeltSeEnGang: ["Ikke helt. Se en gang til og tell sakte!", "Not quite. Look once more and count slowly!"],
  riktigDuTelteAlt: ["Riktig! Du telte alt.", "Right! You counted everything."],
  riktigHerKommerNye: ["Riktig! Her kommer nye.", "Right! Here come new ones."],
  finnesDetEnSomEr: ["Finnes det en som er lengre?", "Is there a longer one?"],
  finnesDetEnSomEr2: ["Finnes det en som er kortere?", "Is there a shorter one?"],
  finnesDetEtLengreLys: ["Finnes det et lengre lys?", "Is there a longer candle?"],
  finnesDetEtKortereLys: ["Finnes det et kortere lys?", "Is there a shorter candle?"],
  altHengerPaRekke: ["Alt henger på rekke!", "Everything is in a row!"],
  alleLyseneStarPaRekke: ["Alle lysene står på rekke!", "All the candles are in a row!"],
  riktigEnGangTil: ["Riktig! En gang til.", "Right! Once more."],
  riktigNyeLys: ["Riktig! Nye lys.", "Right! New candles."],
  hvorVilDuGa: ["Hvor vil du gå?", "Where do you want to go?"],
  stjernaLyserPaToppen: ["Stjerna lyser på toppen!", "The star is shining on top!"],
  nokPyntHengerPaTreet: ["Nok pynt henger på treet! Nå mangler bare stjerna.", "Enough ornaments are up! Only the star is missing."],
  allPyntenHengerNaMangler: ["All pynten henger! Nå mangler bare stjerna.", "All the ornaments are up! Only the star is missing."],
} as const satisfies Record<string, readonly [string, string]>

export type PhraseKey = keyof typeof PHRASES
