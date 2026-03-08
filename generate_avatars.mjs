import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'public/avatars')

// ─── Skin tones ───────────────────────────────────────────────
const SKIN = ['#FDDBB4','#F5C89A','#E8A87C','#C68642','#8D5524']
const SKIN_SHADOW = ['#E8B88A','#D9A870','#C07848','#A06030','#6A3D18']

// ─── Helpers ──────────────────────────────────────────────────
function circle(cx,cy,r,fill,extra='') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`
}
function ellipse(cx,cy,rx,ry,fill,extra='') {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`
}
function rect(x,y,w,h,rx,fill,extra='') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`
}
function path_(d,fill='none',stroke='none',sw=2,extra='') {
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" ${extra}/>`
}

function svg(content, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${darken(bg,40)}" stop-opacity="1"/>
    </radialGradient>
  </defs>
  ${circle(50,50,50,'url(#bg)')}
  ${content}
</svg>`
}

function darken(hex, amt) {
  const n = parseInt(hex.slice(1),16)
  const r = Math.max(0,((n>>16)&255)-amt)
  const g = Math.max(0,((n>>8)&255)-amt)
  const b = Math.max(0,(n&255)-amt)
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`
}
function lighten(hex, amt) {
  const n = parseInt(hex.slice(1),16)
  const r = Math.min(255,((n>>16)&255)+amt)
  const g = Math.min(255,((n>>8)&255)+amt)
  const b = Math.min(255,(n&255)+amt)
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`
}

// ─── Face base ────────────────────────────────────────────────
function face(skin, shadow, eyeColor='#2c1810') {
  return [
    // neck
    ellipse(50,74,10,8,shadow),
    // head
    ellipse(50,46,22,26,skin),
    // ear left
    ellipse(28,47,5,7,skin),
    ellipse(28,47,3,5,shadow,'opacity="0.4"'),
    // ear right
    ellipse(72,47,5,7,skin),
    ellipse(72,47,3,5,shadow,'opacity="0.4"'),
    // face shadow
    `<ellipse cx="50" cy="54" rx="14" ry="8" fill="${shadow}" opacity="0.25"/>`,
    // eyes white
    ellipse(42,44,5,4,'#fff'),
    ellipse(58,44,5,4,'#fff'),
    // iris
    circle(42,44,3,eyeColor),
    circle(58,44,3,eyeColor),
    // pupils
    circle(42,44,1.5,'#000'),
    circle(58,44,1.5,'#000'),
    // eye shine
    circle(43,43,0.8,'#fff'),
    circle(59,43,0.8,'#fff'),
    // nose
    path_(`M48 51 Q50 54 52 51`,'none',shadow,1.5),
    // nostrils
    circle(47.5,52,1,shadow,'opacity="0.5"'),
    circle(52.5,52,1,shadow,'opacity="0.5"'),
  ].join('\n')
}

// ─── Mouth shapes ─────────────────────────────────────────────
function smile()   { return path_(`M43 57 Q50 63 57 57`,'none','#c0605a',2.2) }
function smirkL()  { return path_(`M43 57 Q48 61 55 58`,'none','#c0605a',2.2) }
function smirkR()  { return path_(`M45 58 Q52 61 57 57`,'none','#c0605a',2.2) }
function neutral() { return path_(`M44 58 Q50 59 56 58`,'none','#c0605a',2) }
function bigSmile(skin) {
  return [
    path_(`M42 57 Q50 65 58 57`,'none','#c0605a',2.5),
    `<path d="M42 57 Q50 65 58 57 Q50 61 42 57Z" fill="#fff" opacity="0.6"/>`,
    `<path d="M42 57 Q50 65 58 57 Q50 68 42 57Z" fill="#a04040" opacity="0.4"/>`,
  ].join('\n')
}
function teeth() {
  return [
    path_(`M43 57 Q50 63 57 57`,'none','#c0605a',2.2),
    `<path d="M43 57 Q50 63 57 57 L57 58 Q50 61 43 58Z" fill="#fff"/>`,
  ].join('\n')
}

// ─── Hair styles ──────────────────────────────────────────────
function hairShort(color) {
  return [
    ellipse(50,28,22,14,color),
    `<rect x="28" y="28" width="44" height="10" fill="${color}"/>`,
    ellipse(28,40,6,10,color),
    ellipse(72,40,6,10,color),
  ].join('\n')
}
function hairWavy(color) {
  const hi = lighten(color, 30)
  return [
    ellipse(50,26,23,15,color),
    `<rect x="28" y="26" width="44" height="12" fill="${color}"/>`,
    ellipse(28,40,6,12,color),
    ellipse(72,40,6,12,color),
    path_(`M30 30 Q35 24 40 30 Q45 24 50 30 Q55 24 60 30 Q65 24 70 30`,'none',hi,2,'opacity="0.5"'),
  ].join('\n')
}
function hairCurly(color) {
  const hi = lighten(color, 25)
  return [
    ellipse(50,25,24,16,color),
    `<rect x="27" y="25" width="46" height="14" fill="${color}"/>`,
    ellipse(27,40,7,13,color),
    ellipse(73,40,7,13,color),
    circle(36,22,5,color), circle(44,20,6,color), circle(52,19,6,color),
    circle(60,20,5,color), circle(67,23,5,color),
    circle(37,22,2,hi,'opacity="0.6"'), circle(53,19,2,hi,'opacity="0.6"'),
  ].join('\n')
}
function hairBuzz(color) {
  return [
    ellipse(50,28,22,13,color),
    `<rect x="28" y="28" width="44" height="8" fill="${color}"/>`,
    ellipse(28,39,5,9,color),
    ellipse(72,39,5,9,color),
    `<rect x="28" y="28" width="44" height="6" fill="${darken(color,-10)}" opacity="0.3"/>`,
  ].join('\n')
}
function hairSidePart(color) {
  const hi = lighten(color, 30)
  return [
    ellipse(50,26,23,15,color),
    `<rect x="27" y="26" width="46" height="13" fill="${color}"/>`,
    ellipse(27,40,6,12,color),
    ellipse(73,40,6,12,color),
    path_(`M32 20 Q45 18 70 26`,'none',hi,3,'opacity="0.5"'),
  ].join('\n')
}
function hairLong(color) {
  const hi = lighten(color, 25)
  return [
    ellipse(50,26,23,15,color),
    `<rect x="28" y="26" width="44" height="12" fill="${color}"/>`,
    ellipse(27,50,7,22,color),
    ellipse(73,50,7,22,color),
    `<rect x="27" y="55" width="7" height="20" rx="3" fill="${color}"/>`,
    `<rect x="66" y="55" width="7" height="20" rx="3" fill="${color}"/>`,
    path_(`M30 32 L28 60`, 'none', hi, 1.5, 'opacity="0.4"'),
    path_(`M70 32 L72 60`, 'none', hi, 1.5, 'opacity="0.4"'),
  ].join('\n')
}
function hairBun(color) {
  const hi = lighten(color, 30)
  return [
    ellipse(50,26,22,14,color),
    `<rect x="28" y="26" width="44" height="10" fill="${color}"/>`,
    ellipse(28,39,6,10,color),
    ellipse(72,39,6,10,color),
    circle(50,16,10,color),
    circle(50,16,6,darken(color,15)),
    circle(48,14,2,hi,'opacity="0.5"'),
  ].join('\n')
}
function hairPonytail(color) {
  const hi = lighten(color, 25)
  return [
    ellipse(50,26,22,14,color),
    `<rect x="28" y="26" width="44" height="10" fill="${color}"/>`,
    ellipse(28,39,6,10,color),
    ellipse(72,39,6,10,color),
    `<path d="M72 40 Q80 50 75 65 Q72 70 70 65 Q74 50 68 42Z" fill="${color}"/>`,
    path_(`M73 42 Q79 52 74 63`, 'none', hi, 1.5, 'opacity="0.4"'),
  ].join('\n')
}
function hairBraids(color) {
  const hi = lighten(color, 20)
  return [
    ellipse(50,26,22,14,color),
    `<rect x="28" y="26" width="44" height="10" fill="${color}"/>`,
    ellipse(28,39,6,10,color),
    ellipse(72,39,6,10,color),
    `<path d="M30 42 Q26 52 28 65 Q31 70 34 65 Q31 52 35 42Z" fill="${color}"/>`,
    `<path d="M70 42 Q74 52 72 65 Q69 70 66 65 Q69 52 65 42Z" fill="${color}"/>`,
    path_(`M29 44 Q26 54 28 63`, 'none', hi, 1.2, 'opacity="0.5"'),
    path_(`M71 44 Q74 54 72 63`, 'none', hi, 1.2, 'opacity="0.5"'),
    ellipse(30,50,3,5,darken(color,10),'opacity="0.5"'),
    ellipse(70,50,3,5,darken(color,10),'opacity="0.5"'),
  ].join('\n')
}
function hairPixie(color) {
  const hi = lighten(color, 35)
  return [
    ellipse(50,27,22,13,color),
    `<rect x="28" y="27" width="44" height="9" fill="${color}"/>`,
    ellipse(28,38,5,9,color),
    ellipse(72,38,5,9,color),
    path_(`M30 30 Q40 22 55 24 Q65 24 70 30`, 'none', hi, 2, 'opacity="0.5"'),
  ].join('\n')
}
function bald() {
  return `<ellipse cx="50" cy="28" rx="22" ry="12" fill="#e8c090" opacity="0.3"/>`
}
function capHat(color) {
  return [
    rect(30,20,40,6,3,color),
    `<path d="M27 26 Q50 18 73 26Z" fill="${color}"/>`,
    rect(26,26,48,4,0,darken(color,20)),
    `<ellipse cx="50" cy="20" rx="7" ry="5" fill="${darken(color,15)}"/>`,
  ].join('\n')
}
function beanie(color) {
  return [
    `<path d="M28 38 Q28 16 50 16 Q72 16 72 38Z" fill="${color}"/>`,
    `<rect x="27" y="36" width="46" height="6" rx="3" fill="${darken(color,20)}"/>`,
    circle(50,16,5,lighten(color,30)),
  ].join('\n')
}

// ─── Accessories ──────────────────────────────────────────────
function glasses() {
  return [
    `<rect x="34" y="40" width="12" height="9" rx="4" fill="none" stroke="#444" stroke-width="1.5"/>`,
    `<rect x="54" y="40" width="12" height="9" rx="4" fill="none" stroke="#444" stroke-width="1.5"/>`,
    `<line x1="46" y1="44" x2="54" y2="44" stroke="#444" stroke-width="1.5"/>`,
    `<line x1="28" y1="43" x2="34" y2="43" stroke="#444" stroke-width="1.5"/>`,
    `<line x1="66" y1="43" x2="72" y2="43" stroke="#444" stroke-width="1.5"/>`,
  ].join('\n')
}
function beard(color) {
  return `<path d="M36 58 Q38 68 50 70 Q62 68 64 58 Q58 62 50 62 Q42 62 36 58Z" fill="${color}" opacity="0.85"/>`
}
function stubble(skin) {
  const c = darken(skin, 60)
  return [
    circle(40,58,1.2,c,'opacity="0.4"'), circle(44,60,1.2,c,'opacity="0.4"'),
    circle(48,61,1.2,c,'opacity="0.4"'), circle(52,61,1.2,c,'opacity="0.4"'),
    circle(56,60,1.2,c,'opacity="0.4"'), circle(60,58,1.2,c,'opacity="0.4"'),
  ].join('\n')
}
function earrings(color) {
  return [
    circle(28,50,3,color),
    circle(72,50,3,color),
  ].join('\n')
}
function flowerHair(color) {
  const petals = [0,60,120,180,240,300].map(a => {
    const r = a * Math.PI / 180
    const x = 68 + Math.cos(r) * 4
    const y = 24 + Math.sin(r) * 4
    return circle(x,y,2.5,color)
  }).join('')
  return petals + circle(68,24,2,'#FFD700')
}

// ─── Body / shirt ─────────────────────────────────────────────
function shirt(color) {
  return `<path d="M30 82 Q28 90 30 100 L70 100 Q72 90 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="${color}"/>`
}

// ─── Male avatars (20) ────────────────────────────────────────
const MALE_BG = [
  '#1a237e','#0d47a1','#1b5e20','#4a148c','#37474f',
  '#b71c1c','#e65100','#006064','#004d40','#263238',
  '#1565c0','#2e7d32','#6a1b9a','#c62828','#00695c',
  '#283593','#558b2f','#4527a0','#37474f','#00838f'
]
const MALE_HAIR = [
  '#2c1810','#1a1a1a','#8B4513','#B8860B','#e8d5a3',
  '#cc2200','#4a3728','#d4a017','#222222','#6b3a2a',
  '#1a1a2e','#3d2b1f','#a0522d','#FFD700','#2c1810',
  '#1a1a1a','#8B4513','#cc0044','#888888','#2c1810'
]
const MALE_SKIN_IDX = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4]
const MALE_EYE = ['#1a4a8a','#2c5f2e','#3d2b1f','#8B4513','#1a4a8a','#2c5f2e','#3d2b1f','#2c1810','#1a4a8a','#2c5f2e','#3d2b1f','#8B4513','#1a4a8a','#2c5f2e','#4a3728','#2c1810','#1a4a8a','#2c5f2e','#3d2b1f','#8B4513']
const MALE_MOUTHS = [smile, smirkL, smirkR, neutral, bigSmile, teeth, smile, smirkR, neutral, smile, smirkL, bigSmile, neutral, smile, smirkR, teeth, smirkL, neutral, smile, smirkL]
const MALE_SHIRTS = ['#1565c0','#c62828','#2e7d32','#4527a0','#37474f','#e65100','#00695c','#1565c0','#283593','#c62828','#2e7d32','#37474f','#4527a0','#00695c','#e65100','#1565c0','#283593','#c62828','#2e7d32','#4527a0']

function maleHair(i, hairColor) {
  const styles = [hairShort, hairWavy, hairBuzz, hairSidePart, hairCurly,
                  hairShort, hairWavy, bald, hairSidePart, hairCurly,
                  ()=>beanie('#c62828'), ()=>capHat('#1a237e'), hairBuzz, hairWavy, hairShort,
                  hairSidePart, ()=>capHat('#2e7d32'), hairCurly, hairBuzz, hairSidePart]
  const fn = styles[i]
  return fn === bald ? bald() : fn(hairColor)
}
function maleExtra(i, skin, hairColor) {
  const extras = [
    '',
    glasses(),
    stubble(skin),
    beard(darken(MALE_HAIR[3], 20)),
    glasses() + stubble(skin),
    '',
    stubble(skin),
    beard('#2c1810'),
    glasses(),
    '',
    beard(darken(hairColor, 10)),
    glasses(),
    stubble(skin),
    '',
    beard('#888888'),
    glasses(),
    stubble(skin),
    '',
    glasses() + stubble(skin),
    beard('#2c1810'),
  ]
  return extras[i] || ''
}

for (let i = 0; i < 20; i++) {
  const si = MALE_SKIN_IDX[i]
  const skin = SKIN[si], shadow = SKIN_SHADOW[si]
  const hairColor = MALE_HAIR[i]
  const eyeColor = MALE_EYE[i]
  const content = [
    shirt(MALE_SHIRTS[i]),
    face(skin, shadow, eyeColor),
    maleHair(i, hairColor),
    MALE_MOUTHS[i](),
    maleExtra(i, skin, hairColor),
  ].join('\n')
  const num = String(i+1).padStart(2,'0')
  fs.writeFileSync(path.join(OUT, `male_${num}.svg`), svg(content, MALE_BG[i]))
}
console.log('✓ 20 male avatars')

// ─── Female avatars (20) ──────────────────────────────────────
const FEMALE_BG = [
  '#880e4f','#ad1457','#6a1b9a','#4527a0','#c62828',
  '#e65100','#33691e','#00695c','#0277bd','#37474f',
  '#6d1b7b','#7b1fa2','#283593','#1565c0','#00838f',
  '#558b2f','#4a148c','#bf360c','#b71c1c','#0d47a1'
]
const FEMALE_HAIR = [
  '#1a1a1a','#2c1810','#8B4513','#e8d5a3','#cc2200',
  '#B8860B','#4a3728','#d4a017','#222222','#6b3a2a',
  '#1a1a1a','#cc0044','#4a3728','#FFD700','#2c1810',
  '#8B4513','#1a1a1a','#B8860B','#cc2200','#e8d5a3'
]
const FEMALE_SKIN_IDX = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4]
const FEMALE_EYE = ['#1a4a8a','#2c5f2e','#8B4513','#4a3728','#1a4a8a','#3d2b1f','#2c5f2e','#8B4513','#1a4a8a','#2c5f2e','#3d2b1f','#8B4513','#1a4a8a','#2c5f2e','#3d2b1f','#8B4513','#1a4a8a','#2c5f2e','#4a3728','#2c1810']
const FEMALE_MOUTHS = [smile, bigSmile, smile, smirkR, bigSmile, smile, smirkL, bigSmile, smile, teeth, bigSmile, smile, smirkR, bigSmile, smile, smirkL, bigSmile, smile, teeth, smile]
const FEMALE_SHIRTS = ['#ad1457','#7b1fa2','#c62828','#e65100','#1565c0','#2e7d32','#37474f','#880e4f','#283593','#00695c','#6d1b7b','#c62828','#0277bd','#558b2f','#4a148c','#bf360c','#ad1457','#7b1fa2','#1565c0','#2e7d32']

function femaleHair(i, hairColor) {
  const styles = [hairLong, hairBun, hairWavy, hairPonytail, hairCurly,
                  hairBraids, hairLong, hairBun, hairPixie, hairWavy,
                  hairCurly, hairPonytail, hairBraids, hairLong, hairBun,
                  hairPixie, hairCurly, hairWavy, hairLong, hairBraids]
  return styles[i](hairColor)
}
function femaleExtra(i, skin, hairColor) {
  const EARRING_COLORS = ['#FFD700','#e8d5a3','#ff69b4','#00bcd4','#c0c0c0','#FFD700','#ff69b4','#e8d5a3','#c0c0c0','#FFD700','#00bcd4','#ff69b4','#FFD700','#c0c0c0','#e8d5a3','#ff69b4','#00bcd4','#FFD700','#e8d5a3','#ff69b4']
  const extras = [
    earrings(EARRING_COLORS[0]),
    earrings(EARRING_COLORS[1]),
    earrings(EARRING_COLORS[2]) + glasses(),
    flowerHair('#ff69b4'),
    earrings(EARRING_COLORS[4]),
    earrings(EARRING_COLORS[5]) + flowerHair('#FFD700'),
    earrings(EARRING_COLORS[6]),
    earrings(EARRING_COLORS[7]) + glasses(),
    earrings(EARRING_COLORS[8]),
    earrings(EARRING_COLORS[9]) + flowerHair('#ff1493'),
    earrings(EARRING_COLORS[10]),
    earrings(EARRING_COLORS[11]) + glasses(),
    flowerHair('#e040fb'),
    earrings(EARRING_COLORS[13]),
    earrings(EARRING_COLORS[14]) + flowerHair('#64ffda'),
    earrings(EARRING_COLORS[15]),
    earrings(EARRING_COLORS[16]) + glasses(),
    earrings(EARRING_COLORS[17]),
    flowerHair('#ff80ab'),
    earrings(EARRING_COLORS[19]),
  ]
  return extras[i] || ''
}

for (let i = 0; i < 20; i++) {
  const si = FEMALE_SKIN_IDX[i]
  const skin = SKIN[si], shadow = SKIN_SHADOW[si]
  const hairColor = FEMALE_HAIR[i]
  const eyeColor = FEMALE_EYE[i]
  // Lashes
  const lashes = [
    `<line x1="38" y1="40" x2="36" y2="37" stroke="#222" stroke-width="1.2"/>`,
    `<line x1="41" y1="39" x2="40" y2="36" stroke="#222" stroke-width="1.2"/>`,
    `<line x1="44" y1="39" x2="44" y2="36" stroke="#222" stroke-width="1.2"/>`,
    `<line x1="54" y1="39" x2="54" y2="36" stroke="#222" stroke-width="1.2"/>`,
    `<line x1="57" y1="39" x2="57" y2="36" stroke="#222" stroke-width="1.2"/>`,
    `<line x1="60" y1="40" x2="62" y2="37" stroke="#222" stroke-width="1.2"/>`,
  ].join('')
  const blush = [
    ellipse(36,50,5,3,'#ff8a80','opacity="0.35"'),
    ellipse(64,50,5,3,'#ff8a80','opacity="0.35"'),
  ].join('')
  const content = [
    shirt(FEMALE_SHIRTS[i]),
    face(skin, shadow, eyeColor),
    femaleHair(i, hairColor),
    FEMALE_MOUTHS[i](),
    lashes, blush,
    femaleExtra(i, skin, hairColor),
  ].join('\n')
  const num = String(i+1).padStart(2,'0')
  fs.writeFileSync(path.join(OUT, `female_${num}.svg`), svg(content, FEMALE_BG[i]))
}
console.log('✓ 20 female avatars')

// ─── Animal avatars (20) ──────────────────────────────────────
const animals = [
  // 1. Katt - orange tabby
  () => {
    const bg = '#e65100'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#ef6c00"/>`
    const head = ellipse(50,48,24,22,'#f4a460')
    const ears = [
      `<polygon points="30,30 26,14 40,28" fill="#f4a460"/>`,
      `<polygon points="70,30 74,14 60,28" fill="#f4a460"/>`,
      `<polygon points="31,29 28,17 39,28" fill="#ff8a65"/>`,
      `<polygon points="69,29 72,17 61,28" fill="#ff8a65"/>`,
    ].join('')
    const stripes = [
      `<path d="M38 30 Q42 26 46 30" stroke="#c0622a" stroke-width="1.5" fill="none"/>`,
      `<path d="M54 30 Q58 26 62 30" stroke="#c0622a" stroke-width="1.5" fill="none"/>`,
      `<path d="M50 22 Q52 18 54 22" stroke="#c0622a" stroke-width="1.5" fill="none"/>`,
    ].join('')
    const eyes = [ellipse(41,45,5,4,'#fff'), ellipse(59,45,5,4,'#fff'), circle(41,45,3,'#4caf50'), circle(59,45,3,'#4caf50'), circle(41,45,1.5,'#000'), circle(59,45,1.5,'#000'), circle(42,44,0.8,'#fff'), circle(60,44,0.8,'#fff')].join('')
    const nose = `<path d="M48 52 L50 54 L52 52 Q50 50 48 52Z" fill="#e91e63"/>`
    const whiskers = [`<line x1="28" y1="52" x2="44" y2="53" stroke="#888" stroke-width="1" opacity="0.7"/>`,`<line x1="28" y1="56" x2="44" y2="55" stroke="#888" stroke-width="1" opacity="0.7"/>`,`<line x1="56" y1="53" x2="72" y2="52" stroke="#888" stroke-width="1" opacity="0.7"/>`,`<line x1="56" y1="55" x2="72" y2="56" stroke="#888" stroke-width="1" opacity="0.7"/>`].join('')
    const mouth = `<path d="M47 55 Q50 58 53 55" fill="none" stroke="#c0622a" stroke-width="1.5"/>`
    return svg([body,head,ears,stripes,eyes,nose,whiskers,mouth].join(''), bg)
  },
  // 2. Hund - golden retriever
  () => {
    const bg = '#f57f17'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q60 76 50 76 Q40 76 30 82Z" fill="#f9a825"/>`
    const head = ellipse(50,48,24,23,'#fdd835')
    const ears = [`<ellipse cx="28" cy="50" rx="8" ry="14" fill="#f57f17" transform="rotate(-10,28,50)"/>`,`<ellipse cx="72" cy="50" rx="8" ry="14" fill="#f57f17" transform="rotate(10,72,50)"/>`].join('')
    const muzzle = ellipse(50,55,12,9,'#fff9c4')
    const eyes = [ellipse(40,43,5,4.5,'#fff'),ellipse(60,43,5,4.5,'#fff'),circle(40,43,3,'#5d4037'),circle(60,43,3,'#5d4037'),circle(40,43,1.5,'#000'),circle(60,43,1.5,'#000'),circle(41,42,0.8,'#fff'),circle(61,42,0.8,'#fff')].join('')
    const nose = circle(50,51,4,'#1a1a1a')
    const nostrils = [circle(48.5,51,1,'#333'),circle(51.5,51,1,'#333')].join('')
    const mouth = `<path d="M44 57 Q50 63 56 57" fill="none" stroke="#8d6e63" stroke-width="2"/>`
    const tongue = `<ellipse cx="50" cy="62" rx="4" ry="3" fill="#e91e63" opacity="0.8"/>`
    return svg([body,head,ears,muzzle,eyes,nose,nostrils,mouth,tongue].join(''), bg)
  },
  // 3. Räv
  () => {
    const bg = '#bf360c'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#e64a19"/>`
    const head = ellipse(50,48,23,22,'#ff7043')
    const ears = [`<polygon points="30,30 24,10 44,28" fill="#ff7043"/>`,`<polygon points="70,30 76,10 56,28" fill="#ff7043"/>`,`<polygon points="31,29 26,14 42,28" fill="#fff")/>`,`<polygon points="69,29 74,14 58,28" fill="#fff"/>`].join('')
    const mask = `<ellipse cx="50" cy="54" rx="13" ry="10" fill="#fff"/>`
    const eyes = [ellipse(40,44,5,4,'#fff'),ellipse(60,44,5,4,'#fff'),circle(40,44,3,'#f57f17'),circle(60,44,3,'#f57f17'),circle(40,44,1.5,'#000'),circle(60,44,1.5,'#000'),circle(41,43,0.8,'#fff'),circle(61,43,0.8,'#fff')].join('')
    const nose = `<path d="M47 51 L50 54 L53 51 Q50 49 47 51Z" fill="#1a1a1a"/>`
    const whiskers = [`<line x1="26" y1="52" x2="43" y2="53" stroke="#888" stroke-width="1"/>`,`<line x1="57" y1="53" x2="74" y2="52" stroke="#888" stroke-width="1"/>`].join('')
    const mouth = `<path d="M46 55 Q50 60 54 55" fill="none" stroke="#8d6e63" stroke-width="1.5"/>`
    return svg([body,head,ears,mask,eyes,nose,whiskers,mouth].join(''), bg)
  },
  // 4. Kanin - vit
  () => {
    const bg = '#7b1fa2'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#9c27b0"/>`
    const head = ellipse(50,50,22,21,'#f5f5f5')
    const ears = [`<ellipse cx="38" cy="24" rx="7" ry="16" fill="#f5f5f5"/>`,`<ellipse cx="62" cy="24" rx="7" ry="16" fill="#f5f5f5"/>`,`<ellipse cx="38" cy="24" rx="4" ry="13" fill="#f48fb1"/>`,`<ellipse cx="62" cy="24" rx="4" ry="13" fill="#f48fb1"/>`].join('')
    const eyes = [circle(41,46,5,'#ff80ab'),circle(59,46,5,'#ff80ab'),circle(41,46,3,'#e91e63'),circle(59,46,3,'#e91e63'),circle(41,46,1.5,'#000'),circle(59,46,1.5,'#000'),circle(42,45,0.8,'#fff'),circle(60,45,0.8,'#fff')].join('')
    const nose = circle(50,53,3,'#f48fb1')
    const whiskers = [`<line x1="28" y1="52" x2="44" y2="53" stroke="#bbb" stroke-width="1"/>`,`<line x1="56" y1="53" x2="72" y2="52" stroke="#bbb" stroke-width="1"/>`].join('')
    const mouth = `<path d="M46 55 Q50 59 54 55" fill="none" stroke="#e91e63" stroke-width="1.5"/>`
    const cheeks = [ellipse(35,52,5,3,'#f48fb1','opacity="0.4"'),ellipse(65,52,5,3,'#f48fb1','opacity="0.4"')].join('')
    return svg([body,head,ears,eyes,nose,whiskers,mouth,cheeks].join(''), bg)
  },
  // 5. Björn - brun
  () => {
    const bg = '#4e342e'
    const body = `<path d="M28 80 Q26 95 28 100 L72 100 Q74 95 72 80 Q62 76 50 76 Q38 76 28 80Z" fill="#6d4c41"/>`
    const head = ellipse(50,49,24,23,'#8d6e63')
    const ears = [circle(31,30,9,'#8d6e63'),circle(69,30,9,'#8d6e63'),circle(31,30,5,'#6d4c41'),circle(69,30,5,'#6d4c41')].join('')
    const muzzle = ellipse(50,56,12,8,'#bcaaa4')
    const eyes = [ellipse(40,43,5,5,'#fff'),ellipse(60,43,5,5,'#fff'),circle(40,43,3.5,'#4e342e'),circle(60,43,3.5,'#4e342e'),circle(40,43,2,'#000'),circle(60,43,2,'#000'),circle(41,42,0.8,'#fff'),circle(61,42,0.8,'#fff')].join('')
    const nose = ellipse(50,52,5,4,'#1a1a1a')
    const mouth = `<path d="M44 58 Q50 64 56 58" fill="none" stroke="#5d4037" stroke-width="2"/>`
    return svg([body,head,ears,muzzle,eyes,nose,mouth].join(''), bg)
  },
  // 6. Panda
  () => {
    const bg = '#263238'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#37474f"/>`
    const head = ellipse(50,49,23,22,'#f5f5f5')
    const ears = [circle(30,29,9,'#1a1a1a'),circle(70,29,9,'#1a1a1a')].join('')
    const eyePatches = [ellipse(40,45,8,7,'#1a1a1a'),ellipse(60,45,8,7,'#1a1a1a')].join('')
    const eyes = [ellipse(40,45,4,4,'#fff'),ellipse(60,45,4,4,'#fff'),circle(40,45,2.5,'#000'),circle(60,45,2.5,'#000'),circle(41,44,0.8,'#fff'),circle(61,44,0.8,'#fff')].join('')
    const muzzle = ellipse(50,56,11,8,'#e0e0e0')
    const nose = ellipse(50,52,4,3,'#1a1a1a')
    const mouth = `<path d="M45 58 Q50 63 55 58" fill="none" stroke="#616161" stroke-width="2"/>`
    return svg([body,head,ears,eyePatches,eyes,muzzle,nose,mouth].join(''), bg)
  },
  // 7. Uggla
  () => {
    const bg = '#4a148c'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q60 74 50 74 Q40 74 30 82Z" fill="#6a1b9a"/>`
    const head = circle(50,45,26,'#8d6e63')
    const ears = [`<polygon points="35,22 28,8 44,20" fill="#8d6e63"/>`,`<polygon points="65,22 72,8 56,20" fill="#8d6e63"/>`].join('')
    const eyeRings = [circle(40,44,10,'#fff'),circle(60,44,10,'#fff')].join('')
    const eyes = [circle(40,44,7,'#ffeb3b'),circle(60,44,7,'#ffeb3b'),circle(40,44,4,'#000'),circle(60,44,4,'#000'),circle(41,43,1.2,'#fff'),circle(61,43,1.2,'#fff')].join('')
    const beak = `<polygon points="50,50 45,58 55,58" fill="#ff8f00"/>`
    const belly = ellipse(50,60,12,8,'#d7ccc8','opacity="0.6"')
    return svg([body,head,ears,eyeRings,eyes,beak,belly].join(''), bg)
  },
  // 8. Pingvin
  () => {
    const bg = '#1a237e'
    const tuxedo = `<path d="M32 78 Q30 95 30 100 L70 100 Q70 95 68 78 Q60 72 50 72 Q40 72 32 78Z" fill="#1a1a1a"/>`
    const belly = `<path d="M38 80 Q36 95 38 100 L62 100 Q64 95 62 80 Q58 76 50 76 Q42 76 38 80Z" fill="#f5f5f5"/>`
    const head = circle(50,44,22,'#1a1a1a')
    const face = ellipse(50,48,13,12,'#f5f5f5')
    const eyes = [circle(43,40,4,'#fff'),circle(57,40,4,'#fff'),circle(43,40,2.5,'#1a1a1a'),circle(57,40,2.5,'#1a1a1a'),circle(44,39,0.8,'#fff'),circle(58,39,0.8,'#fff')].join('')
    const beak = `<polygon points="50,50 44,56 56,56" fill="#ff8f00"/>`
    const cheeks = [circle(37,50,4,'#ffccbc','opacity="0.6"'),circle(63,50,4,'#ffccbc','opacity="0.6"')].join('')
    return svg([tuxedo,belly,head,face,eyes,beak,cheeks].join(''), bg)
  },
  // 9. Räv - röd variant
  () => {
    const bg = '#e65100'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#f4511e"/>`
    const head = ellipse(50,48,23,22,'#ff8a50')
    const ears = [`<polygon points="31,31 26,12 43,29" fill="#ff8a50"/>`,`<polygon points="69,31 74,12 57,29" fill="#ff8a50"/>`,`<polygon points="32,30 28,15 41,29" fill="#fff"/>`+`<polygon points="68,30 72,15 59,29" fill="#fff"/>`].join('')
    const mask = ellipse(50,54,13,10,'#fff')
    const eyes = [ellipse(40,44,5,4,'#fff'),ellipse(60,44,5,4,'#fff'),circle(40,44,3,'#2196f3'),circle(60,44,3,'#2196f3'),circle(40,44,1.5,'#000'),circle(60,44,1.5,'#000'),circle(41,43,0.8,'#fff'),circle(61,43,0.8,'#fff')].join('')
    const nose = `<path d="M47 51 L50 54 L53 51 Q50 48 47 51Z" fill="#000"/>`
    const mouth = `<path d="M45 56 Q50 60 55 56" fill="none" stroke="#c62828" stroke-width="1.5"/>`
    const whiskers = [`<line x1="26" y1="53" x2="43" y2="53" stroke="#aaa" stroke-width="1"/>`,`<line x1="57" y1="53" x2="74" y2="53" stroke="#aaa" stroke-width="1"/>`].join('')
    return svg([body,head,ears,mask,eyes,nose,mouth,whiskers].join(''), bg)
  },
  // 10. Katt - svart
  () => {
    const bg = '#212121'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#2c2c2c"/>`
    const head = ellipse(50,48,23,22,'#1a1a1a')
    const ears = [`<polygon points="30,30 25,12 42,28" fill="#1a1a1a"/>`,`<polygon points="70,30 75,12 58,28" fill="#1a1a1a"/>`,`<polygon points="31,29 27,15 40,28" fill="#ff80ab"/>`,`<polygon points="69,29 73,15 60,28" fill="#ff80ab"/>`].join('')
    const eyes = [ellipse(40,44,5,4,'#fff'),ellipse(60,44,5,4,'#fff'),circle(40,44,3,'#66bb6a'),circle(60,44,3,'#66bb6a'),circle(40,44,1.5,'#000'),circle(60,44,1.5,'#000'),circle(41,43,0.8,'#fff'),circle(61,43,0.8,'#fff')].join('')
    const nose = `<path d="M48 52 L50 54 L52 52 Q50 50 48 52Z" fill="#e91e63"/>`
    const whiskers = [`<line x1="26" y1="52" x2="43" y2="53" stroke="#666" stroke-width="1"/>`,`<line x1="57" y1="53" x2="74" y2="52" stroke="#666" stroke-width="1"/>`,`<line x1="26" y1="56" x2="43" y2="55" stroke="#666" stroke-width="1"/>`,`<line x1="57" y1="55" x2="74" y2="56" stroke="#666" stroke-width="1"/>`].join('')
    const mouth = `<path d="M46 55 Q50 59 54 55" fill="none" stroke="#555" stroke-width="1.5"/>`
    return svg([body,head,ears,eyes,nose,whiskers,mouth].join(''), bg)
  },
  // 11. Hjort
  () => {
    const bg = '#33691e'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#558b2f"/>`
    const head = ellipse(50,50,22,21,'#a1887f')
    // Antlers
    const antlers = `<path d="M32 28 Q28 18 24 10 M28 18 Q22 16 18 18 M32 28 Q30 20 26 14 M68 28 Q72 18 76 10 M72 18 Q78 16 82 18 M68 28 Q70 20 74 14" stroke="#6d4c41" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
    const ears = [ellipse(29,44,6,10,'#a1887f'),ellipse(71,44,6,10,'#a1887f')].join('')
    const muzzle = ellipse(50,56,12,9,'#bcaaa4')
    const eyes = [ellipse(40,44,5,4.5,'#fff'),ellipse(60,44,5,4.5,'#fff'),circle(40,44,3,'#5d4037'),circle(60,44,3,'#5d4037'),circle(40,44,1.5,'#000'),circle(60,44,1.5,'#000'),circle(41,43,0.8,'#fff'),circle(61,43,0.8,'#fff')].join('')
    const nose = ellipse(50,52,4,3,'#3e2723')
    const mouth = `<path d="M44 57 Q50 62 56 57" fill="none" stroke="#795548" stroke-width="2"/>`
    const spots = [circle(38,58,3,'#d7ccc8','opacity="0.5"'),circle(46,60,2,'#d7ccc8','opacity="0.5"'),circle(54,60,2,'#d7ccc8','opacity="0.5"'),circle(62,58,3,'#d7ccc8','opacity="0.5"')].join('')
    return svg([body,head,antlers,ears,muzzle,eyes,nose,mouth,spots].join(''), bg)
  },
  // 12. Enhörning
  () => {
    const bg = '#880e4f'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#ad1457"/>`
    const head = ellipse(50,49,22,21,'#f8bbd0')
    const mane = [ellipse(28,42,7,16,'#ce93d8'),ellipse(72,42,7,16,'#ce93d8'),ellipse(28,42,5,13,'#e1bee7')].join('')
    const horn = `<polygon points="50,14 45,30 55,30" fill="#FFD700"/><line x1="48" y1="18" x2="52" y2="28" stroke="#FFF9C4" stroke-width="1" opacity="0.7"/>`
    const ears = [ellipse(33,28,6,9,'#f8bbd0'),ellipse(67,28,6,9,'#f8bbd0'),ellipse(33,28,3,6,'#f48fb1'),ellipse(67,28,3,6,'#f48fb1')].join('')
    const eyes = [ellipse(40,46,5,4.5,'#fff'),ellipse(60,46,5,4.5,'#fff'),circle(40,46,3,'#7b1fa2'),circle(60,46,3,'#7b1fa2'),circle(40,46,1.5,'#000'),circle(60,46,1.5,'#000'),circle(41,45,0.8,'#fff'),circle(61,45,0.8,'#fff')].join('')
    const lashes = [`<line x1="38" y1="42" x2="36" y2="39" stroke="#222" stroke-width="1.2"/>`,`<line x1="62" y1="42" x2="64" y2="39" stroke="#222" stroke-width="1.2"/>`].join('')
    const nose = ellipse(50,54,4,3,'#f48fb1')
    const mouth = `<path d="M45 57 Q50 62 55 57" fill="none" stroke="#e91e63" stroke-width="1.5"/>`
    const stars = [circle(34,60,2,'#FFD700','opacity="0.7"'),circle(66,60,2,'#FFD700','opacity="0.7"'),circle(50,65,2,'#FFD700','opacity="0.7"')].join('')
    return svg([body,head,mane,horn,ears,eyes,lashes,nose,mouth,stars].join(''), bg)
  },
  // 13. Varg
  () => {
    const bg = '#37474f'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#546e7a"/>`
    const head = ellipse(50,49,24,23,'#78909c')
    const ears = [`<polygon points="30,28 24,10 43,26" fill="#78909c"/>`,`<polygon points="70,28 76,10 57,26" fill="#78909c"/>`,`<polygon points="31,27 26,13 41,26" fill="#f8bbd0"/>`,`<polygon points="69,27 74,13 59,26" fill="#f8bbd0"/>`].join('')
    const muzzle = ellipse(50,56,13,9,'#b0bec5')
    const eyes = [ellipse(40,43,5,4,'#fff'),ellipse(60,43,5,4,'#fff'),circle(40,43,3,'#f57f17'),circle(60,43,3,'#f57f17'),circle(40,43,1.5,'#000'),circle(60,43,1.5,'#000'),circle(41,42,0.8,'#fff'),circle(61,42,0.8,'#fff')].join('')
    const nose = ellipse(50,52,5,4,'#1a1a1a')
    const mouth = `<path d="M43 58 Q50 64 57 58" fill="none" stroke="#546e7a" stroke-width="2"/>`
    const whiskers = [`<line x1="26" y1="53" x2="43" y2="54" stroke="#aaa" stroke-width="1"/>`,`<line x1="57" y1="54" x2="74" y2="53" stroke="#aaa" stroke-width="1"/>`].join('')
    return svg([body,head,ears,muzzle,eyes,nose,mouth,whiskers].join(''), bg)
  },
  // 14. Ekorre
  () => {
    const bg = '#6d4c41'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#8d6e63"/>`
    const head = ellipse(50,50,21,20,'#a1887f')
    const ears = [ellipse(33,30,7,10,'#a1887f'),ellipse(67,30,7,10,'#a1887f'),ellipse(33,30,4,7,'#ffccbc'),ellipse(67,30,4,7,'#ffccbc')].join('')
    const tail = `<path d="M74 60 Q90 50 88 70 Q86 85 70 78 Q82 72 80 62 Q78 54 74 60Z" fill="#8d6e63"/>`
    const stripe = `<path d="M76 62 Q88 55 86 70 Q84 78 76 74 Q82 68 80 62Z" fill="#e0c9b4" opacity="0.5"/>`
    const muzzle = ellipse(50,56,11,8,'#d7ccc8')
    const eyes = [ellipse(40,46,4.5,4,'#fff'),ellipse(60,46,4.5,4,'#fff'),circle(40,46,2.5,'#4e342e'),circle(60,46,2.5,'#4e342e'),circle(40,46,1.5,'#000'),circle(60,46,1.5,'#000'),circle(41,45,0.7,'#fff'),circle(61,45,0.7,'#fff')].join('')
    const nose = ellipse(50,52,3,2.5,'#3e2723')
    const mouth = `<path d="M45 56 Q50 60 55 56" fill="none" stroke="#795548" stroke-width="1.5"/>`
    return svg([body,tail,stripe,head,ears,muzzle,eyes,nose,mouth].join(''), bg)
  },
  // 15. Kyckling
  () => {
    const bg = '#f9a825'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#fbc02d"/>`
    const head = circle(50,48,22,'#fff9c4')
    const comb = [`<path d="M42 28 Q44 18 48 24 Q50 16 52 24 Q56 18 58 28" fill="#ef5350"/>`,`<ellipse cx="50" cy="28" rx="9" ry="3" fill="#ef5350"/>`].join('')
    const eyes = [ellipse(40,44,5,4.5,'#fff'),ellipse(60,44,5,4.5,'#fff'),circle(40,44,3,'#1a1a1a'),circle(60,44,3,'#1a1a1a'),circle(41,43,1,'#fff'),circle(61,43,1,'#fff')].join('')
    const beak = `<polygon points="50,52 44,58 56,58" fill="#ff8f00"/>`
    const cheeks = [ellipse(35,50,5,3,'#ff8a80','opacity="0.5"'),ellipse(65,50,5,3,'#ff8a80','opacity="0.5"')].join('')
    const wings = [`<ellipse cx="26" cy="62" rx="8" ry="6" fill="#fff9c4" opacity="0.8"/>`,`<ellipse cx="74" cy="62" rx="8" ry="6" fill="#fff9c4" opacity="0.8"/>`].join('')
    return svg([body,wings,head,comb,eyes,beak,cheeks].join(''), bg)
  },
  // 16. Fisk
  () => {
    const bg = '#006064'
    const bodyFish = `<ellipse cx="50" cy="55" rx="28" ry="18" fill="#00acc1"/>`
    const tail = `<polygon points="22,55 10,42 10,68" fill="#0097a7"/>`
    const fin = `<path d="M38 37 Q45 28 58 37" fill="#00bcd4" opacity="0.8"/>`
    const scales = [circle(45,52,4,'#0097a7','opacity="0.4"'),circle(53,52,4,'#0097a7','opacity="0.4"'),circle(60,55,4,'#0097a7','opacity="0.4"'),circle(45,60,4,'#0097a7','opacity="0.4"'),circle(53,60,4,'#0097a7','opacity="0.4"')].join('')
    const eye = [circle(63,48,7,'#fff'),circle(63,48,4,'#1565c0'),circle(63,48,2,'#000'),circle(64,47,1,'#fff')].join('')
    const mouth = `<path d="M72 56 Q76 60 72 64" fill="none" stroke="#00838f" stroke-width="2" stroke-linecap="round"/>`
    const bubble1 = circle(80,40,3,'#b2ebf2','opacity="0.7"')
    const bubble2 = circle(86,32,2,'#b2ebf2','opacity="0.5"')
    return svg([bodyFish,tail,fin,scales,eye,mouth,bubble1,bubble2].join(''), bg)
  },
  // 17. Sköldpadda
  () => {
    const bg = '#1b5e20'
    const shell = ellipse(50,52,26,21,'#388e3c')
    const shellPatch = ellipse(50,52,18,14,'#2e7d32')
    const shellLines = [`<line x1="50" y1="38" x2="50" y2="66" stroke="#1b5e20" stroke-width="1.5" opacity="0.5"/>`,`<line x1="34" y1="44" x2="66" y2="60" stroke="#1b5e20" stroke-width="1.5" opacity="0.5"/>`,`<line x1="66" y1="44" x2="34" y2="60" stroke="#1b5e20" stroke-width="1.5" opacity="0.5"/>`].join('')
    const head = circle(50,34,13,'#66bb6a')
    const legs = [ellipse(28,56,7,5,'#66bb6a','transform="rotate(-20,28,56)"'),ellipse(72,56,7,5,'#66bb6a','transform="rotate(20,72,56)"'),ellipse(32,68,6,5,'#66bb6a','transform="rotate(20,32,68)"'),ellipse(68,68,6,5,'#66bb6a','transform="rotate(-20,68,68)"')].join('')
    const eyes = [circle(44,32,3.5,'#fff'),circle(56,32,3.5,'#fff'),circle(44,32,2,'#1b5e20'),circle(56,32,2,'#1b5e20'),circle(44,32,1,'#000'),circle(56,32,1,'#000')].join('')
    const mouth = `<path d="M44 38 Q50 42 56 38" fill="none" stroke="#1b5e20" stroke-width="1.5"/>`
    return svg([legs,shell,shellPatch,shellLines,head,eyes,mouth].join(''), bg)
  },
  // 18. Björn - isbjörn
  () => {
    const bg = '#0d47a1'
    const body = `<path d="M28 80 Q26 95 28 100 L72 100 Q74 95 72 80 Q62 76 50 76 Q38 76 28 80Z" fill="#e3f2fd"/>`
    const head = ellipse(50,49,24,23,'#f5f5f5')
    const ears = [circle(31,30,9,'#f5f5f5'),circle(69,30,9,'#f5f5f5'),circle(31,30,5,'#e0e0e0'),circle(69,30,5,'#e0e0e0')].join('')
    const muzzle = ellipse(50,56,12,8,'#e0e0e0')
    const eyes = [ellipse(40,43,5,5,'#fff'),ellipse(60,43,5,5,'#fff'),circle(40,43,3.5,'#37474f'),circle(60,43,3.5,'#37474f'),circle(40,43,2,'#000'),circle(60,43,2,'#000'),circle(41,42,0.8,'#fff'),circle(61,42,0.8,'#fff')].join('')
    const nose = ellipse(50,52,5,4,'#37474f')
    const mouth = `<path d="M44 58 Q50 64 56 58" fill="none" stroke="#546e7a" stroke-width="2"/>`
    const snowflakes = [`<text x="26" y="25" font-size="8" fill="#90caf9" opacity="0.8">❄</text>`,`<text x="65" y="20" font-size="7" fill="#90caf9" opacity="0.6">❄</text>`].join('')
    return svg([body,head,ears,muzzle,eyes,nose,mouth,snowflakes].join(''), bg)
  },
  // 19. Katt - siames
  () => {
    const bg = '#5d4037'
    const body = `<path d="M30 82 Q28 95 30 100 L70 100 Q72 95 70 82 Q62 78 50 78 Q38 78 30 82Z" fill="#6d4c41"/>`
    const head = ellipse(50,48,23,22,'#d7ccc8')
    const ears = [`<polygon points="30,30 26,13 43,29" fill="#d7ccc8"/>`,`<polygon points="70,30 74,13 57,29" fill="#d7ccc8"/>`,`<polygon points="31,29 27,16 41,29" fill="#bcaaa4"/>`,`<polygon points="69,29 73,16 59,29" fill="#bcaaa4"/>`].join('')
    const mask = [`<ellipse cx="50" cy="44" rx="14" ry="10" fill="#a1887f" opacity="0.4"/>`,`<ellipse cx="50" cy="56" rx="10" ry="8" fill="#a1887f" opacity="0.3"/>`].join('')
    const eyes = [ellipse(40,44,5,4,'#fff'),ellipse(60,44,5,4,'#fff'),circle(40,44,3,'#1565c0'),circle(60,44,3,'#1565c0'),circle(40,44,1.5,'#000'),circle(60,44,1.5,'#000'),circle(41,43,0.8,'#fff'),circle(61,43,0.8,'#fff')].join('')
    const nose = `<path d="M48 52 L50 54 L52 52 Q50 50 48 52Z" fill="#ef9a9a"/>`
    const whiskers = [`<line x1="26" y1="52" x2="43" y2="53" stroke="#bbb" stroke-width="1"/>`,`<line x1="57" y1="53" x2="74" y2="52" stroke="#bbb" stroke-width="1"/>`,`<line x1="27" y1="56" x2="43" y2="55" stroke="#bbb" stroke-width="1"/>`,`<line x1="57" y1="55" x2="73" y2="56" stroke="#bbb" stroke-width="1"/>`].join('')
    const mouth = `<path d="M46 55 Q50 59 54 55" fill="none" stroke="#a1887f" stroke-width="1.5"/>`
    return svg([body,head,ears,mask,eyes,nose,whiskers,mouth].join(''), bg)
  },
  // 20. Flodhäst
  () => {
    const bg = '#7b1fa2'
    const body = `<path d="M26 80 Q24 95 26 100 L74 100 Q76 95 74 80 Q62 74 50 74 Q38 74 26 80Z" fill="#9c27b0"/>`
    const head = ellipse(50,52,27,24,'#ba68c8')
    const ears = [circle(28,35,8,'#ba68c8'),circle(72,35,8,'#ba68c8'),circle(28,35,5,'#ce93d8'),circle(72,35,5,'#ce93d8')].join('')
    const muzzle = ellipse(50,60,16,11,'#ce93d8')
    const nostrils = [ellipse(44,58,3.5,2.5,'#9c27b0'),ellipse(56,58,3.5,2.5,'#9c27b0')].join('')
    const eyes = [ellipse(38,42,5,4,'#fff'),ellipse(62,42,5,4,'#fff'),circle(38,42,3,'#4a148c'),circle(62,42,3,'#4a148c'),circle(38,42,1.5,'#000'),circle(62,42,1.5,'#000'),circle(39,41,0.8,'#fff'),circle(63,41,0.8,'#fff')].join('')
    const mouth = `<path d="M40 64 Q50 70 60 64" fill="none" stroke="#7b1fa2" stroke-width="2.5"/>`
    return svg([body,head,ears,muzzle,nostrils,eyes,mouth].join(''), bg)
  },
]

animals.forEach((fn, i) => {
  const num = String(i+1).padStart(2,'0')
  fs.writeFileSync(path.join(OUT, `animal_${num}.svg`), fn())
})
console.log('✓ 20 animal avatars')
console.log('\n🎉 Alla 60 avatarer genererade!')
