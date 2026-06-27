<?php
// ==========================================
// SISTEM ANTI-CACHE (MEMAKSA BROWSER UPDATE REAL-TIME)
// ==========================================
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Expires: 0");
header("Content-Type: application/json");

include 'koneksi.php';

$query = "SELECT * FROM pendaftaran ORDER BY id DESC";
$result = mysqli_query($koneksi, $query);

$data = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Konversi tipe data angka agar JavaScript tidak bingung saat sorting
    $row['id'] = (int)$row['id'];
    $row['jarak_meter'] = (int)$row['jarak_meter'];
    $row['rt'] = $row['rt'] ? (int)$row['rt'] : null;
    $row['rw'] = $row['rw'] ? (int)$row['rw'] : null;
    $row['tinggi_badan'] = $row['tinggi_badan'] ? (int)$row['tinggi_badan'] : null;
    $row['berat_badan'] = $row['berat_badan'] ? (int)$row['berat_badan'] : null;
    $row['lingkar_kepala'] = $row['lingkar_kepala'] ? (int)$row['lingkar_kepala'] : null;
    $row['waktu_tempuh_jam'] = (int)$row['waktu_tempuh_jam'];
    $row['waktu_tempuh_menit'] = (int)$row['waktu_tempuh_menit'];
    $row['jumlah_saudara_kandung'] = (int)$row['jumlah_saudara_kandung'];

    // Mencegah status kosong terbaca error di JavaScript
    // Teks default HARUS disamakan dengan JS: 'Belum Diperiksa' (Huruf B dan D kapital)
    $row['status_validasi'] = !empty($row['status_validasi']) ? $row['status_validasi'] : 'Belum Diperiksa';
    
    // Perhatikan nama variabelnya di sini agar sesuai dengan JS lama Anda
    // Atau jika JS Anda memanggil item.status_lulus, kita bisa memetakan ke properti tersebut:
    $row['status_lulus'] = !empty($row['status_kelulusan']) ? $row['status_kelulusan'] : 'PROSES VALIDASI';

    $data[] = $row;
}

echo json_encode($data);
?>