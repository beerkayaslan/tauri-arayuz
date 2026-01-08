# Tauri Auto-Update Kılavuzu

Bu belgede Tauri uygulamanızın güncelleme sisteminin nasıl çalıştığı ve nasıl kullanılacağı açıklanmaktadır.

## 🔑 Önemli Dosyalar

- **Private Key**: `~/.tauri/tauri-arayuz.key` (GİZLİ TUTUN!)
- **Public Key**: `~/.tauri/tauri-arayuz.key.pub`

## 🚀 Güncelleme Yayınlama Adımları

### 1. GitHub Repository Ayarları

GitHub repository'nizde şu secret'ları ekleyin:

**Settings → Secrets and variables → Actions → New repository secret**

1. `TAURI_SIGNING_PRIVATE_KEY`: Private key dosyasının içeriği
   ```bash
   cat ~/.tauri/tauri-arayuz.key
   ```

2. `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: Key oluştururken girdiğiniz şifre

### 2. Endpoint URL'sini Güncelle

[src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) dosyasında `endpoints` URL'sini kendi GitHub repo'nuza göre değiştirin:

```json
"endpoints": [
  "https://github.com/KULLANICI_ADI/REPO_ADI/releases/latest/download/latest.json"
]
```

Örnek:
```json
"endpoints": [
  "https://github.com/berkayaslan/tauri-arayuz/releases/latest/download/latest.json"
]
```

### 3. Versiyon Güncelleme

Yeni bir güncelleme yayınlamak için her iki dosyada da versiyonu güncelleyin:

- `package.json` → `"version": "0.2.0"`
- `src-tauri/tauri.conf.json` → `"version": "0.2.0"`

### 4. Release Oluşturma

```bash
# Değişiklikleri commit'le
git add .
git commit -m "v0.2.0 - Yeni özellikler"

# Tag oluştur ve push'la
git tag v0.2.0
git push origin main --tags
```

GitHub Actions otomatik olarak:
- ✅ macOS (Intel ve Apple Silicon)
- ✅ Windows
- ✅ Linux

için build alıp release oluşturacak.

## 🖥️ Yerel Build (İmzalı)

Manuel olarak imzalı build almak için:

```bash
# Environment variable'ları ayarla
export TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/tauri-arayuz.key)
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="şifreniz"

# Build al
bun tauri build
```

Build çıktıları `src-tauri/target/release/bundle/` içinde olacak.

## 📁 Güncelleme Dosyaları

Her release'de şu dosyalar oluşturulur:

| Platform | Dosya |
|----------|-------|
| macOS | `tauri-arayuz.app.tar.gz` + `.sig` |
| Windows | `tauri-arayuz_x.x.x_x64-setup.nsis.zip` + `.sig` |
| Linux | `tauri-arayuz_x.x.x_amd64.AppImage.tar.gz` + `.sig` |
| Manifest | `latest.json` |

## 🔄 Güncelleme Akışı

1. Uygulama açıldığında otomatik güncelleme kontrolü yapar
2. Yeni versiyon varsa sağ altta bildirim gösterir
3. Kullanıcı "Güncelle" dediğinde:
   - Güncelleme indirilir
   - Doğrulanır (imza kontrolü)
   - Kurulur
   - Uygulama yeniden başlatılır

## 🛠️ Test Etme

Güncelleme sistemini test etmek için:

1. İlk olarak `v0.1.0` versiyonunu build alıp kurun
2. Versiyonu `v0.2.0` yapın
3. GitHub'a push'layın ve release oluşturun
4. Kurulan uygulamayı açın - güncelleme bildirimi görünecek

## ⚠️ Önemli Notlar

- **Private key'i asla paylaşmayın!**
- Private key veya şifreyi kaybederseniz, **artık güncelleme gönderemezsiniz**
- Her release'de versiyon numarası artmalıdır
- Güncelleme sadece production build'lerde çalışır (`bun tauri dev` değil)

## 🌐 Alternatif: Kendi Sunucunuz

GitHub yerine kendi sunucunuzu kullanmak isterseniz, `endpoints` URL'sini değiştirin ve şu formatta bir JSON döndürün:

```json
{
  "version": "0.2.0",
  "notes": "Yeni özellikler eklendi",
  "pub_date": "2026-01-08T12:00:00Z",
  "platforms": {
    "darwin-x86_64": {
      "url": "https://sunucunuz.com/releases/tauri-arayuz-0.2.0-x64.app.tar.gz",
      "signature": "İMZA_BURAYA"
    },
    "darwin-aarch64": {
      "url": "https://sunucunuz.com/releases/tauri-arayuz-0.2.0-aarch64.app.tar.gz",
      "signature": "İMZA_BURAYA"
    },
    "linux-x86_64": {
      "url": "https://sunucunuz.com/releases/tauri-arayuz-0.2.0.AppImage.tar.gz",
      "signature": "İMZA_BURAYA"
    },
    "windows-x86_64": {
      "url": "https://sunucunuz.com/releases/tauri-arayuz-0.2.0-setup.nsis.zip",
      "signature": "İMZA_BURAYA"
    }
  }
}
```
