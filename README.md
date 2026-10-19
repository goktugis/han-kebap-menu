# Han Kebap Steakhouse – QR Menü

Mobil uyumlu, kategorili, aramalı, statik (sunucusuz) dijital menü.

## Dosyalar
| Dosya | Ne işe yarar |
|---|---|
| `menu-data.js` | **Menü içeriği** (ürünler, fiyatlar, adres, telefon). Sadece burayı düzenle. |
| `index.html`, `style.css`, `app.js` | Menü sayfası |
| `images/` | Fotoğraflar (hazır stok görseller) |
| `qr/han-kebap-qr.png` / `.svg` | QR kod (PNG baskı için, SVG vektörel) |
| `qr/qr-kart.html` | Yazdırılabilir A5 masa kartı |

## Yayına alma (QR'ın çalışması için menü internette olmalı)
1. Klasörü ücretsiz bir statik hosta yükle: **Netlify Drop** (app.netlify.com/drop – klasörü sürükle-bırak), Cloudflare Pages veya GitHub Pages.
2. Aldığın adresle QR'ı yeniden üret:
   ```
   npm run qr -- https://senin-adresin.netlify.app
   ```
   (Alan adı alırsan `menu.hankebap.com` gibi bir adres QR'ı değiştirmeden sitenin yerini değiştirmeni sağlar.)
3. `qr/qr-kart.html` dosyasını tarayıcıda aç → Yazdır.

## Menüyü güncelleme
`menu-data.js` dosyasını düzenle, klasörü tekrar yükle. QR değişmez.
- `soldOut: true` → ürün "Tükendi" görünür.
- `tags`: `sef`, `aci`, `vegan`, `yeni`
- `img`: `images/` içindeki dosya adı (opsiyonel)

## Komutlar
```
npm install      # bir kez
npm run serve    # http://localhost:5173 yerel önizleme
npm test         # veri + QR + tarayıcı (mobil/masaüstü) testleri
npm run images   # stok fotoğrafları yeniden indirir
```

## Fotoğraf kaynakları
Unsplash (ücretsiz lisans) ve Wikimedia Commons (Public Domain / CC0: *Adana kebab*, *Baklava – Turkish special*, *Künefe in Tarsus*).
