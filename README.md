# Sistem Penerimaan Murid Baru (SPMB) - SDN Cibogor 01 

Aplikasi pendaftaran berbasis web (*Client-Side*) untuk mensimulasikan Penerimaan Murid Baru (SPMB) di SDN Cibogor 01 menggunakan seleksi **umur dan kelengkapan data juga berdasarkan jarak rumah**.

## Fitur Utama
- **Pendaftaran (Orang Tua):** Formulir input data calon siswa beserta unggah dokumen/berkas pendaftaran.
- **Hasil Penerimaan (Umum):** Halaman publik untuk melihat urutan peringkat kelulusan berdasarkan umur, kelengkapan berkas dan jarak rumah secara *real-time*.
- **Panel Verifikasi (Admin):** Halaman khusus operator sekolah untuk memeriksa berkas, melakukan validasi (Setuju/Tolak), serta fitur *sorting* & *filtering* data pendaftar.
- **Simpan Data Lokal:** Menggunakan `localStorage` browser sehingga data demonstrasi tetap tersimpan saat halaman dimuat ulang.

---

## Panduan Menjalankan Aplikasi Secara Lokal (Offline)

Jika Anda ingin mengunduh dan menjalankan aplikasi ini langsung di komputer Anda tanpa koneksi internet, ikuti langkah berikut:

1. **Unduh Proyek:**
   Klik tombol hijau **`Code`** di bagian atas halaman repositori ini, lalu pilih **`Download ZIP`**.
2. **Ekstrak File:**
   Ekstrak file ZIP yang sudah diunduh ke dalam folder komputer Anda.
3. **Jalankan Aplikasi:**
   Buka folder hasil ekstrak, lalu klik dua kali (*double click*) pada file **`index.html`**. Aplikasi akan langsung terbuka dan berjalan di browser Anda.

---

## Struktur Folder Proyek
```text
├── assets/          # Berisi file gambar logo instansi dan aset visual pendukung
├── index.html       # Halaman utama (Struktur HTML & Antarmuka Aplikasi)
├── style.css        # Gaya tampilan (Desain tata letak & pewarnaan)
├── main.js          # Logika program (Fungsi zonasi, verifikasi admin, & localStorage)
└── README.md        # Panduan dan dokumentasi aplikasi
