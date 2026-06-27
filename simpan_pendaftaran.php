<?php
// Tampilkan pesan error murni untuk mempermudah deteksi
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
include 'koneksi.php';

// ==========================================
// 1. PROSES UPLOAD FILE (PDF/GAMBAR)
// ==========================================
$nama_file_baru = null;

if (isset($_FILES['berkas_digital']) && $_FILES['berkas_digital']['error'] === UPLOAD_ERR_OK) {
    $nama_file_asli = $_FILES['berkas_digital']['name'];
    $tmp_name = $_FILES['berkas_digital']['tmp_name'];
    
    // Ekstrak ekstensi file dan buat nama unik
    $ekstensi = strtolower(pathinfo($nama_file_asli, PATHINFO_EXTENSION));
    $nama_file_baru = time() . '_' . uniqid() . '.' . $ekstensi;
    
    // Tentukan folder tujuan
    $folder_tujuan = __DIR__ . '/uploads/';
    if (!is_dir($folder_tujuan)) {
        mkdir($folder_tujuan, 0777, true);
    }

    // Pindahkan file ke folder uploads
    if (!move_uploaded_file($tmp_name, $folder_tujuan . $nama_file_baru)) {
        echo json_encode(["status" => "error", "message" => "Gagal memindahkan file ke folder uploads! Cek hak akses folder."]);
        exit;
    }
} elseif (isset($_FILES['berkas_digital']) && $_FILES['berkas_digital']['error'] !== UPLOAD_ERR_NO_FILE) {
    $err_code = $_FILES['berkas_digital']['error'];
    echo json_encode(["status" => "error", "message" => "File gagal diunggah! (Kode Error: $err_code). Pastikan ukuran PDF Anda tidak melebihi 2MB."]);
    exit;
}

// ==========================================
// 2. PROSES DATA TEKS (ANTI ERROR ARRAY)
// ==========================================
$fields = [
    'nama_lengkap', 'jenis_kelamin', 'nisn', 'nik', 'no_kk', 'tempat_lahir', 'tanggal_lahir', 
    'no_registrasi_akta_lahir', 'agama_kepercayaan', 'kebutuhan_khusus_pd', 'alamat_jalan', 'rt', 'rw', 'nama_dusun', 
    'nama_kelurahan', 'kecamatan', 'kode_pos', 'tempat_tinggal', 'moda_transportasi', 
    'anak_keberapa', 'nama_ayah_kandung', 'nik_ayah', 'tahun_lahir_ayah', 'pendidikan_ayah', 
    'pekerjaan_ayah', 'penghasilan_ayah', 'nama_ibu_kandung', 'nik_ibu', 'tahun_lahir_ibu', 
    'pendidikan_ibu', 'pekerjaan_ibu', 'penghasilan_ibu', 'nomor_hp', 'tinggi_badan', 
    'berat_badan', 'lingkar_kepala', 'waktu_tempuh_jam', 'waktu_tempuh_menit', 
    'jumlah_saudara_kandung', 'sekolah_asal', 'latitude', 'longitude', 'jarak_meter'
];

$data = [];
foreach ($fields as $field) {
    if (isset($_POST[$field])) {
        // Cek jika data berupa Array (contoh: checkbox Kebutuhan Khusus)
        if (is_array($_POST[$field])) {
            $nilai_input = implode(', ', $_POST[$field]);
        } else {
            $nilai_input = $_POST[$field];
        }
        $data[$field] = mysqli_real_escape_string($koneksi, trim($nilai_input));
    } else {
        $data[$field] = '';
    }
}

// Jika ada file yang berhasil diupload, masukkan juga ke array
if ($nama_file_baru) {
    $fields[] = 'berkas_digital';
    $data['berkas_digital'] = $nama_file_baru;
}

// ==========================================
// 3. GENERATE QUERY INSERT OTOMATIS
// ==========================================
$kolom_sql = implode(', ', $fields);
$nilai_sql_array = [];

foreach ($fields as $f) {
    if ($data[$f] === '') {
        $nilai_sql_array[] = "NULL";
    } else {
        $nilai_sql_array[] = "'" . $data[$f] . "'";
    }
}

$nilai_sql = implode(', ', $nilai_sql_array);
$query = "INSERT INTO pendaftaran ($kolom_sql) VALUES ($nilai_sql)";

if (mysqli_query($koneksi, $query)) {
    echo json_encode(["status" => "success", "message" => "Pendaftaran dan berkas digital berhasil disimpan!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Database Error: " . mysqli_error($koneksi)]);
}
?>