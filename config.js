// Saytdagi barcha matnlar va rasmlar shu yerda — kodga tegmasdan tahrirlanadi.
window.BDAY = {
  name: "Masuma",
  age: 18,
  from: "", // masalan: "Ayyubxon" — bo'sh bo'lsa ko'rsatilmaydi

  // photos/ papkasidagi rasmlar (tartib bo'yicha). caption — ixtiyoriy,
  // pos — rasm kartaga sig'maganda qaysi joyi ko'rinsin (CSS object-position).
  photos: [
    { src: "photos/01.jpg", caption: "Jiddiy va go'zal ✨", pos: "55% 30%" },
    { src: "photos/02.jpg", caption: "Stil — 10/10 🖤", pos: "40% 40%" },
    { src: "photos/03.jpg", caption: "Tarixga qiziquvchan qalb 📚", pos: "80% 55%" },
    { src: "photos/04.jpg", caption: "Har bir lahza — sarguzasht 🌙", pos: "40% 60%" },
    { src: "photos/05.jpg", caption: "You look beautiful today 🤍", pos: "48% 50%" },
  ],

  // Sovg'a ochilganda bir marta chalinadigan klip; tugagach "Happy Birthday"
  // music-box'ga silliq o'tadi. Bo'sh qoldirilsa darhol music-box.
  intro: "music/masuma.m4a",

  // music/ papkasiga mp3 qo'yilsa shu yerga yoziladi; bo'sh bo'lsa
  // brauzerning o'zida sintez qilingan "Happy Birthday" music-box chalinadi.
  tracks: [],

  letter: [
    "Bugun sen 18 yoshga to'lding — hayotingning eng chiroyli sahifalaridan biri shu kundan boshlanadi.",
    "Kulging hech qachon so'nmasin, orzularing esa har kuni bir qadam yaqinlashsin.",
    "Sen atrofingdagilarga yorug'lik va iliqlik ulashasan — shu nur doim sen bilan bo'lsin.",
    "Baxtli bo'l, sog' bo'l va o'zingga ishon. Eng go'zal kunlar hali oldinda! ✨",
  ],

  wishes: [
    "Baxt", "Sog'lik", "Muhabbat", "Omad", "Orzular", "Kulgu",
    "Ilhom", "Tinchlik", "Sarguzasht", "Do'stlar", "Muvaffaqiyat", "Quvonch",
  ],
};
