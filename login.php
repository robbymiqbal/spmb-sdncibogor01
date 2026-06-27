<?php
header("Content-Type: application/json");
include 'koneksi.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Username dan Password wajib diisi!"]);
    exit;
}

// Amankan input dari SQL Injection
$username = mysqli_real_escape_string($koneksi, $username);
$password = mysqli_real_escape_string($koneksi, $password);

$query = "SELECT * FROM admin WHERE username='$username' AND password='$password'";
$result = mysqli_query($koneksi, $query);

if (mysqli_num_rows($result) > 0) {
    echo json_encode(["status" => "success", "message" => "Login Berhasil!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Username atau Password salah!"]);
}
?>