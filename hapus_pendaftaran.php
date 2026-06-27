<?php
header("Content-Type: application/json");
include 'koneksi.php';

if (isset($_POST['id'])) {
    $id = (int)$_POST['id'];
    $query = "DELETE FROM pendaftaran WHERE id=$id";
    if (mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "message" => "Data pendaftaran berhasil dihapus permanen!"]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($koneksi)]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "ID tidak valid."]);
}
?>