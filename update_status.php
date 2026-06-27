<?php
header("Content-Type: application/json");
include 'koneksi.php';

if (isset($_POST['id']) && isset($_POST['status_validasi'])) {
    $id = (int)$_POST['id'];
    $input_status = mysqli_real_escape_string($koneksi, $_POST['status_validasi']);

    // Logika penentuan status
    if ($input_status === 'Valid') {
        $status_validasi  = 'Valid';
        $status_kelulusan = 'DITERIMA'; // Langsung set DITERIMA
    } elseif ($input_status === 'Tidak Valid') {
        $status_validasi  = 'Tidak Valid';
        $status_kelulusan = 'TIDAK DITERIMA';
    } else {
        $status_validasi  = 'Belum Diperiksa';
        $status_kelulusan = 'PROSES VALIDASI';
    }

    // QUERY UPDATE (MEMASTIKAN KEDUA KOLOM TERUPDATE)
    $query = "UPDATE pendaftaran SET 
              status_validasi = '$status_validasi', 
              status_kelulusan = '$status_kelulusan' 
              WHERE id = $id";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "message" => "Status berhasil diperbarui!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal update: " . mysqli_error($koneksi)]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
}
?>