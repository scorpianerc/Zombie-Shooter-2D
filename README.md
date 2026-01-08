# Zombie Shooter 2D

Game survival 2D yang menegangkan, dibangun dengan Next.js dan Phaser.

## Tentang Proyek Ini

Bertahan hidup dari kiamat di **Zombie Shooter 2D**, sebuah game arcade shooter berbasis browser yang memacu adrenalin. Pemain akan dilempar ke dunia gelap yang tak kenal ampun dan dipenuhi oleh mayat hidup. Berbekal kecerdikan dan senjata andalan, tujuanmu sederhana: bertahan hidup selama mungkin.

Dibuat menggunakan **Next.js** untuk antarmuka pengguna (UI) yang modern dan responsif, serta **Phaser** untuk fisika game dan rendering yang kuat. Kode kini telah **direfaktor** menjadi lebih modular dengan sistem Manajer terpisah untuk UI, Input, dan Suara, menjadikannya lebih mudah dikembangkan dan dipelihara.

**Sorotan Utama:**
*   **Aura Mencekam:** Visual gelap yang imersif dan desain suara yang mendukung.
*   **Aksi Tanpa Henti:** Mekanisme survival berbasis gelombang (wave) yang semakin lama semakin sulit.
*   **Dukungan Cross-Platform:** Dapat dimainkan di Desktop (Mouse & Keyboard) dan Mobile (Touch Controls).

## Fitur

- **Gameplay Survival**: Bertarung melawan gelombang zombie yang tak ada habisnya.
- **Variasi Musuh**:
    - **Normal**: Zombie standar.
    - **Exploder**: Zombie cepat yang meledak saat mati.
    - **Boss**: Musuh raksasa dengan armor tebal yang muncul setiap 5 gelombang.
- **Power-Ups**: Dapatkan bantuan dari item spesial:
    - 💚 **Health**: Memulihkan darah.
    - ⚡ **Speed**: Meningkatkan kecepatan gerak.
    - 🔫 **Rapid Fire**: Meningkatkan kecepatan tembak.
    - 🛡️ **Shield**: Memberikan kekebalan sementara.
- **Dukungan Mobile**: Joystick virtual dan tombol tembak auto-aim untuk pengalaman mobile yang mulus.
- **Sistem Skor & Highscore**: Lacak skor tertinggi dan lihat riwayat permainan Anda.

## Kontrol

### Desktop
- **W, A, S, D / Panah**: Bergerak
- **Mouse**: Membidik
- **Klik Kiri**: Menembak
- **ESC**: Pause Game

### Mobile
- **Joystick Virtual (Kiri)**: Bergerak
- **Tombol FIRE (Kanan)**: Menembak (Otomatis membidik zombie terdekat)

## Memulai (Getting Started)

### Prasyarat

- Node.js (Disarankan versi LTS terbaru)
- npm atau yarn

### Instalasi

1. Clone repositori:
   ```bash
   git clone <url-repositori-anda>
   ```
2. Masuk ke direktori proyek:
   ```bash
   cd zombie-shooter-2d
   ```
3. Instal dependencies:
   ```bash
   npm install
   # atau
   yarn install
   ```

### Menjalankan Game

Jalankan server development:

```bash
npm run dev
# atau
yarn dev
```

Buka [http://localhost:3000](http://localhost:3000) dengan browser Anda untuk melihat hasilnya.

## Deployment ke Vercel

Proyek ini dioptimalkan untuk deployment di [Vercel](https://vercel.com).

1. Push kode Anda ke repositori Git (GitHub, GitLab, atau Bitbucket).
2. Impor proyek ke Vercel.
3. Vercel akan secara otomatis mendeteksi framework Next.js dan mengonfigurasi pengaturan build.
4. Klik **Deploy**.

Untuk detail lebih lanjut, silakan cek [dokumentasi deployment Next.js](https://nextjs.org/docs/deployment).
