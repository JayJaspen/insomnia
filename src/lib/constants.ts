// ─── Öppettider ────────────────────────────────────────────────
export const OPEN_HOUR  = 22   // 22:00
export const CLOSE_HOUR =  6   // 06:00
export const TIMEZONE   = 'Europe/Stockholm'

// ─── Humörsval ─────────────────────────────────────────────────
export const MOODS = [
  { id: 'sleepy',       emoji: '😴', label: 'Sömnig',          desc: 'Trött men vill inte sova ensam' },
  { id: 'happy',        emoji: '😊', label: 'Glad',            desc: 'På gott humör, vill chatta' },
  { id: 'melancholic',  emoji: '🌙', label: 'Melankolisk',     desc: 'Lite vemodigt stämd' },
  { id: 'thoughtful',   emoji: '🤔', label: 'Tankfull',        desc: 'Funderar på livet' },
  { id: 'restless',     emoji: '⚡', label: 'Rastlös',         desc: 'Energifull, kan inte varva ner' },
  { id: 'anxious',      emoji: '😰', label: 'Nervös / Orolig', desc: 'Ångest eller oro' },
  { id: 'listening',    emoji: '🎧', label: 'Vill lyssna',     desc: 'Lyssnar mer än skriver' },
  { id: 'loving',       emoji: '💜', label: 'Kärleksfull',     desc: 'Värmer med ord' },
  { id: 'funny',        emoji: '😂', label: 'Rolig',           desc: 'Vill skämta och ha kul' },
  { id: 'stressed',     emoji: '😤', label: 'Stressad',        desc: 'Lite spänd, behöver prata' },
] as const

export type MoodId = (typeof MOODS)[number]['id']

// ─── Avatarer ──────────────────────────────────────────────────
export const AVATARS = {
  male: Array.from({ length: 20 }, (_, i) => `male_${String(i + 1).padStart(2, '0')}`),
  female: Array.from({ length: 20 }, (_, i) => `female_${String(i + 1).padStart(2, '0')}`),
  animal: Array.from({ length: 20 }, (_, i) => `animal_${String(i + 1).padStart(2, '0')}`),
}

export const AVATAR_LABELS: Record<string, string> = {
  male: 'Man',
  female: 'Kvinna',
  animal: 'Djur',
}

// ─── Svenska Län ───────────────────────────────────────────────
export const COUNTIES: { id: string; name: string }[] = [
  { id: 'AB', name: 'Stockholms län' },
  { id: 'C',  name: 'Uppsala län' },
  { id: 'D',  name: 'Södermanlands län' },
  { id: 'E',  name: 'Östergötlands län' },
  { id: 'F',  name: 'Jönköpings län' },
  { id: 'G',  name: 'Kronobergs län' },
  { id: 'H',  name: 'Kalmar län' },
  { id: 'I',  name: 'Gotlands län' },
  { id: 'K',  name: 'Blekinge län' },
  { id: 'M',  name: 'Skåne län' },
  { id: 'N',  name: 'Hallands län' },
  { id: 'O',  name: 'Västra Götalands län' },
  { id: 'S',  name: 'Värmlands län' },
  { id: 'T',  name: 'Örebro län' },
  { id: 'U',  name: 'Västmanlands län' },
  { id: 'W',  name: 'Dalarnas län' },
  { id: 'X',  name: 'Gävleborgs län' },
  { id: 'Y',  name: 'Västernorrlands län' },
  { id: 'Z',  name: 'Jämtlands län' },
  { id: 'AC', name: 'Västerbottens län' },
  { id: 'BD', name: 'Norrbottens län' },
]

// ─── Städer per Län ────────────────────────────────────────────
export const CITIES_BY_COUNTY: Record<string, string[]> = {
  AB: ['Stockholm','Solna','Sundbyberg','Täby','Nacka','Huddinge','Järfälla',
       'Sollentuna','Södertälje','Lidingö','Haninge','Tyresö','Upplands Väsby',
       'Vallentuna','Upplands-Bro','Sigtuna','Botkyrka','Salem','Nykvarn'],
  C:  ['Uppsala','Enköping','Håbo','Tierp','Älvkarleby','Knivsta','Heby','Östhammar'],
  D:  ['Eskilstuna','Nyköping','Katrineholm','Oxelösund','Flen','Gnesta',
       'Strängnäs','Trosa','Vingåker'],
  E:  ['Linköping','Norrköping','Motala','Mjölby','Finspång','Åtvidaberg',
       'Ödeshög','Vadstena','Kinda','Boxholm','Ydre','Söderköping'],
  F:  ['Jönköping','Huskvarna','Värnamo','Nässjö','Eksjö','Vetlanda',
       'Gislaved','Vaggeryd','Aneby','Habo','Mullsjö','Sävsjö','Tranås'],
  G:  ['Växjö','Ljungby','Alvesta','Tingsryd','Uppvidinge','Lessebo',
       'Markaryd','Älmhult'],
  H:  ['Kalmar','Oskarshamn','Västervik','Nybro','Mörbylånga','Hultsfred',
       'Borgholm','Emmaboda','Högsby','Mönsterås','Torsås','Vimmerby'],
  I:  ['Visby','Slite','Hemse'],
  K:  ['Karlskrona','Ronneby','Karlshamn','Olofström','Sölvesborg'],
  M:  ['Malmö','Helsingborg','Lund','Kristianstad','Landskrona','Eslöv',
       'Hässleholm','Ystad','Trelleborg','Vellinge','Staffanstorp','Kävlinge',
       'Burlöv','Lomma','Svedala','Skurup','Sjöbo','Höör','Hörby','Perstorp',
       'Klippan','Åstorp','Bjuv','Simrishamn','Tomelilla','Bromölla','Osby',
       'Östra Göinge','Örkelljunga'],
  N:  ['Halmstad','Varberg','Kungsbacka','Falkenberg','Laholm','Ängelholm'],
  O:  ['Göteborg','Mölndal','Borås','Trollhättan','Skövde','Uddevalla',
       'Lerum','Partille','Härryda','Kungsbacka','Alingsås','Vänersborg',
       'Lidköping','Falköping','Mariestad','Skara','Tibro','Tidaholm',
       'Hjo','Karlsborg','Töreboda','Grästorp','Essunga','Vara','Götene',
       'Lidköping','Herrljunga','Tranemo','Bollebygd','Mark','Svenljunga',
       'Ulricehamn','Bengtsfors','Mellerud','Färgelanda','Lysekil','Sotenäs',
       'Strömstad','Tanum','Munkedal','Orust','Tjörn','Stenungsund','Ale',
       'Kungälv','Öckerö'],
  S:  ['Karlstad','Kristinehamn','Säffle','Hammarö','Filipstad','Hagfors',
       'Arvika','Eda','Torsby','Storfors','Munkfors','Forshaga','Grums',
       'Kil','Sunne','Årjäng'],
  T:  ['Örebro','Lindesberg','Kumla','Hallsberg','Laxå','Degerfors',
       'Karlskoga','Askersund','Nora','Hällefors','Ljusnarsberg'],
  U:  ['Västerås','Köping','Sala','Arboga','Kungsör','Skinnskatteberg',
       'Surahammar','Hallstahammar','Norberg','Fagersta'],
  W:  ['Falun','Borlänge','Mora','Ludvika','Avesta','Gagnef','Leksand',
       'Rättvik','Orsa','Älvdalen','Smedjebacken','Säter','Hedemora',
       'Vansbro','Malung-Sälen'],
  X:  ['Gävle','Sandviken','Hudiksvall','Bollnäs','Söderhamn','Ljusdal',
       'Hofors','Ockelbo','Ovanåker','Nordanstig','Härjedalen'],
  Y:  ['Sundsvall','Härnösand','Kramfors','Timrå','Sollefteå','Ånge'],
  Z:  ['Östersund','Strömsund','Åre','Berg','Krokom','Ragunda',
       'Bräcke','Härjedalen'],
  AC: ['Umeå','Skellefteå','Lycksele','Vilhelmina','Storuman','Dorotea',
       'Åsele','Norsjö','Malå','Sorsele','Vindeln','Vännäs','Bjurholm',
       'Nordmaling','Örnsköldsvik'],
  BD: ['Luleå','Kiruna','Piteå','Boden','Gällivare','Haparanda','Kalix',
       'Arvidsjaur','Arjeplog','Älvsbyn','Överkalix','Övertorneå',
       'Pajala','Jokkmokk','Råneå'],
}

// ─── Kön ───────────────────────────────────────────────────────
export const GENDERS = [
  { value: 'man',    label: 'Man' },
  { value: 'kvinna', label: 'Kvinna' },
  { value: 'annat',  label: 'Annat' },
]
