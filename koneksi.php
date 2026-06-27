<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_spmb";

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    die(json_encode(["status" => "error", "message" => "Koneksi database gagal: " . mysqli_connect_error()]));
}
?>