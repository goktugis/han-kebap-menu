/*
 * HAN KEBAP STEAKHOUSE - MENÜ VERİSİ
 * -----------------------------------
 * Menüyü değiştirmek için sadece bu dosyayı düzenle.
 *  - Fiyatlar örnektir (₺). Kendi fiyatlarınla değiştir.
 *  - tags: "sef" (Şefin Önerisi), "aci" (Acılı), "vegan" (Vejetaryen), "yeni" (Yeni)
 *  - img: (opsiyonel) ürün fotoğrafı, images/ klasöründeki dosya adı
 *  - soldOut: true yaparsan ürün "Tükendi" olarak görünür.
 */
const MENU_DATA = {
  restaurant: {
    name: "Han Kebap",
    subtitle: "Steakhouse",
    tagline: "Közün ustalığı, etin onuru",
    hours: "Her gün 11:00 – 00:00",
    address: "Adres bilgisi buraya eklenecek",
    phone: "+90 000 000 00 00",
    instagram: "",
    note: "Alerjen bilgisi için lütfen servis personelimize danışınız. Fiyatlara KDV dahildir.",
  },
  categories: [
    {
      id: "baslangiclar",
      name: "Başlangıçlar",
      img: "baslangiclar.jpg",
      items: [
        { name: "Humus", desc: "Nohut ezmesi, tahin, zeytinyağı, pul biber", price: 150, tags: ["vegan"], img: "baslangiclar.jpg" },
        { name: "Haydari", desc: "Süzme yoğurt, nane, sarımsak, ceviz", price: 140, tags: ["vegan"] },
        { name: "Acılı Ezme", desc: "Domates, biber, soğan, nar ekşisi", price: 120, tags: ["aci", "vegan"] },
        { name: "Sigara Böreği", desc: "El açması yufka, beyaz peynir, maydanoz (6 adet)", price: 190, tags: [] },
        { name: "Kaşarlı Mantar", desc: "Kremalı ve kaşarlı fırınlanmış mantar", price: 210, tags: [] },
        { name: "Han Meze Tabağı", desc: "Humus, haydari, acılı ezme, patlıcan salatası, közlenmiş biber", price: 320, tags: ["sef"] },
      ],
    },
    {
      id: "corbalar",
      name: "Çorbalar",
      img: "corbalar.jpg",
      items: [
        { name: "Mercimek Çorbası", desc: "Geleneksel tarif, limon ve kruton ile", price: 110, tags: ["vegan"], img: "corbalar.jpg" },
        { name: "Ezogelin Çorbası", desc: "Kırmızı mercimek, bulgur, nane", price: 110, tags: ["vegan"] },
        { name: "Yayla Çorbası", desc: "Yoğurt, pirinç, nane", price: 115, tags: [] },
        { name: "Kelle Paça", desc: "Sarımsaklı sirke eşliğinde", price: 180, tags: [] },
      ],
    },
    {
      id: "salatalar",
      name: "Salatalar",
      img: "salatalar.jpg",
      items: [
        { name: "Çoban Salata", desc: "Domates, salatalık, biber, soğan, maydanoz", price: 130, tags: ["vegan"] },
        { name: "Gavurdağı Salatası", desc: "Cevizli, nar ekşili, domates ve soğan", price: 160, tags: ["vegan"] },
        { name: "Roka Parmesan", desc: "Roka, parmesan, cherry domates, balsamik", price: 175, tags: [] },
        { name: "Steak Salata", desc: "Dilimlenmiş dana bonfile, karışık yeşillik, hardal sos", price: 340, tags: [] },
      ],
    },
    {
      id: "steaklar",
      name: "Steaklar",
      img: "steaklar.jpg",
      items: [
        { name: "Dana Bonfile", desc: "200 gr, yumuşak ve sulu, yanında közlenmiş sebze", price: 780, tags: ["sef"], img: "bonfile.jpg" },
        { name: "Antrikot", desc: "250 gr, dengeli yağ dokusu, tereyağlı patates", price: 720, tags: [], img: "antrikot.jpg" },
        { name: "Ribeye", desc: "300 gr, mermer dokulu, yoğun aromalı", price: 890, tags: ["sef"], img: "ribeye.jpg" },
        { name: "T-Bone", desc: "450 gr, bonfile ve kontrafile bir arada", price: 1050, tags: [], img: "tbone.jpg" },
        { name: "Tomahawk", desc: "1 kg, 2 kişilik, servis öncesi dinlendirilir", price: 2400, tags: ["sef"], img: "tomahawk.jpg" },
        { name: "Kuzu Pirzola", desc: "300 gr, kekik ve tereyağı ile ızgara", price: 820, tags: [] },
        { name: "Dry Aged Antrikot", desc: "250 gr, 30 gün dinlendirilmiş", price: 990, tags: ["yeni"] },
      ],
    },
    {
      id: "kebaplar",
      name: "Kebaplar",
      img: "kebaplar.jpg",
      items: [
        { name: "Adana Kebap", desc: "El kıyması, kuyruk yağı, lavaş, közlenmiş biber ve domates", price: 450, tags: ["aci", "sef"], img: "adana.jpg" },
        { name: "Urfa Kebap", desc: "Acısız el kıyması, lavaş, közlenmiş biber ve domates", price: 450, tags: [] },
        { name: "Beyti Sarma", desc: "Lavaşa sarılı kıyma, yoğurt, tereyağlı domates sos", price: 520, tags: [] },
        { name: "Ali Nazik", desc: "Közlenmiş patlıcan, yoğurt, kuşbaşı et", price: 540, tags: [] },
        { name: "Kuşbaşı Kebap", desc: "Marine edilmiş dana kuşbaşı, pilav", price: 520, tags: [], img: "kusbasi.jpg" },
        { name: "Tavuk Şiş", desc: "Özel marinasyon, pilav, közlenmiş sebze", price: 380, tags: [], img: "kebaplar.jpg" },
        { name: "Han Karışık Izgara", desc: "Adana, kuzu pirzola, kuşbaşı, tavuk şiş, kanat (2 kişilik)", price: 1450, tags: ["sef"], img: "soslar.jpg" },
      ],
    },
    {
      id: "yan-lezzetler",
      name: "Yan Lezzetler",
      img: "yan-lezzetler.jpg",
      items: [
        { name: "Pirinç Pilavı", desc: "Tereyağlı, şehriyeli", price: 90, tags: ["vegan"] },
        { name: "Közlenmiş Sebze", desc: "Patlıcan, biber, domates, soğan", price: 120, tags: ["vegan"] },
        { name: "Patates Kızartması", desc: "Çıtır, baharatlı", price: 110, tags: ["vegan"], img: "yan-lezzetler.jpg" },
        { name: "Tereyağlı Patates Püresi", desc: "Kremsi ve yumuşak", price: 120, tags: [] },
        { name: "Soğan Halkası", desc: "Çıtır panelenmiş, acı sos ile", price: 120, tags: [] },
        { name: "Izgara Mantar", desc: "Sarımsak ve kekik ile", price: 130, tags: ["vegan"] },
      ],
    },
    {
      id: "soslar",
      name: "Soslar",
      img: "soslar.jpg",
      items: [
        { name: "Biber Sos", desc: "Yeşil biberli, kremalı", price: 60, tags: [] },
        { name: "Mantar Sos", desc: "Kremalı mantar", price: 60, tags: [] },
        { name: "Demi-Glace", desc: "Geleneksel kırmızı şarap bazlı", price: 70, tags: [] },
        { name: "Barbekü Sos", desc: "Hafif dumanlı", price: 50, tags: [] },
        { name: "Acı Sos", desc: "Ev yapımı", price: 40, tags: ["aci"] },
      ],
    },
    {
      id: "tatlilar",
      name: "Tatlılar",
      img: "tatlilar.jpg",
      items: [
        { name: "Künefe", desc: "Antep fıstıklı, sıcak servis, 1 porsiyon", price: 220, tags: ["sef"], img: "tatlilar.jpg" },
        { name: "Fırın Sütlaç", desc: "Geleneksel tarif", price: 150, tags: [] },
        { name: "Kazandibi", desc: "Karamelize, yumuşak", price: 150, tags: [] },
        { name: "Baklava", desc: "Antep fıstıklı, 4 dilim", price: 260, tags: [], img: "baklava.jpg" },
        { name: "Sufle", desc: "Akışkan çikolatalı, dondurma ile", price: 210, tags: [] },
        { name: "Dondurma", desc: "3 top, seçmeli", price: 130, tags: [] },
      ],
    },
    {
      id: "icecekler",
      name: "İçecekler",
      img: "icecekler.jpg",
      items: [
        { name: "Ayran", desc: "Bakır kasede, köpüklü", price: 60, tags: [] },
        { name: "Şalgam", desc: "Acılı veya acısız", price: 70, tags: [] },
        { name: "Kola / Fanta / Sprite", desc: "330 ml", price: 80, tags: [], img: "icecekler.jpg" },
        { name: "Soda / Meyveli Soda", desc: "200 ml", price: 60, tags: [] },
        { name: "Taze Limonata", desc: "Nane ile", price: 110, tags: [], img: "limonata.jpg" },
        { name: "Maden Suyu", desc: "Doğal, 200 ml", price: 50, tags: [] },
        { name: "Su", desc: "500 ml", price: 30, tags: [] },
        { name: "Türk Kahvesi", desc: "Közde, lokum ile", price: 100, tags: [] },
        { name: "Çay", desc: "İnce belli bardakta", price: 40, tags: [], img: "cay.jpg" },
      ],
    },
  ],
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = MENU_DATA;
}
