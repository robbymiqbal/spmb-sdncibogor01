<?php
// ==========================================
// SISTEM EKSPORT EXCEL INSTAN (NATIVE PHP) - FULL DATA
// ==========================================

include 'koneksi.php';

// Menentukan nama file otomatis berdasarkan waktu unduh
$filename = "Data_Pendaftar_SPMB_" . date('Ymd_His') . ".xls";

// Mengatur header agar browser mengenali output sebagai file Excel (.xls)
header("Content-Type: application/vnd.ms-excel");
header("Content-Disposition: attachment; filename=\"$filename\"");
header("Pragma: no-cache");
header("Expires: 0");

// Ambil seluruh data pendaftaran
$query = "SELECT * FROM pendaftaran ORDER BY id DESC";
$result = mysqli_query($koneksi, $query);
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; color: #1e293b; margin-bottom: 5px; }
        .subtitle { font-size: 11pt; text-align: center; color: #64748b; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; }
        th { 
            background-color: #0056b3; 
            color: #ffffff; 
            font-weight: bold; 
            text-align: center; 
            padding: 10px; 
            border: 1px solid #cbd5e1; 
            font-size: 11pt;
            white-space: nowrap;
        }
        td { 
            padding: 8px; 
            border: 1px solid #cbd5e1; 
            color: #334155;
            font-size: 10pt;
            vertical-align: middle;
        }
        tr:nth-child(even) td { background-color: #f8fafc; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        /* Proteksi agar angka 0 di depan (NIK/NISN/No HP) tidak hilang di Excel */
        .format-text { mso-number-format: "\@"; text-align: left; }
    </style>
</head>
<body>

    <div class="title">REKAP DATA PENDAFTARAN MURID BARU (SPMB)</div>
    <div class="title">SDN CIBOGOR 01</div>
    <div class="subtitle">Waktu Unduh: <?php echo date('d-m-Y H:i:s'); ?> WIB</div>
    
    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>No Urut Kelulusan</th>
                <th>Status Validasi</th>
                <th>Status Kelulusan</th>
                
                <th >Nama Lengkap</th>
                <th >Jenis Kelamin</th>
                <th >NISN</th>
                <th >NIK</th>
                <th >No. KK</th>
                <th >Tempat Lahir</th>
                <th >Tanggal Lahir</th>
                <th >No. Reg Akta</th>
                <th >Agama</th>
                <th >Kewarganegaraan</th>
                <th >Negara WNA</th>
                <th >Kebutuhan Khusus</th>
                <th >Alamat Jalan</th>
                <th >RT</th>
                <th >RW</th>
                <th >Dusun</th>
                <th >Kelurahan/Desa</th>
                <th >Kecamatan</th>
                <th >Kode Pos</th>
                <th >Tempat Tinggal</th>
                <th >Transportasi</th>
                <th >Anak Ke-</th>
                <th >Punya KIP</th>
                
                <th >Nama Ayah</th>
                <th >NIK Ayah</th>
                <th >Tahun Lahir Ayah</th>
                <th >Pendidikan Ayah</th>
                <th >Pekerjaan Ayah</th>
                <th >Penghasilan Ayah</th>
                
                <th >Nama Ibu</th>
                <th >NIK Ibu</th>
                <th >Tahun Lahir Ibu</th>
                <th >Pendidikan Ibu</th>
                <th >Pekerjaan Ibu</th>
                <th >Penghasilan Ibu</th>
                
                <th >Nama Wali</th>
                <th >NIK Wali</th>
                <th >Tahun Lahir Wali</th>
                
                <th >Telp Rumah</th>
                <th >No HP/WA</th>
                <th >Email</th>
                
                <th >Tinggi (cm)</th>
                <th >Berat (kg)</th>
                <th >Lingkar Kepala (cm)</th>
                <th >Waktu Tempuh (Jam)</th>
                <th >Waktu Tempuh (Menit)</th>
                <th >Jumlah Saudara</th>
                <th >NIS Asal</th>
                <th >Sekolah Asal</th>
                
                <th >Latitude</th>
                <th >Longitude</th>
                <th >Jarak Radius (m)</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $no = 1;
            while($row = mysqli_fetch_assoc($result)) {
                echo "<tr>";
                echo "<td class='text-center'>".$no++."</td>";
                echo "<td class='text-center'>".$row['id']."</td>";
                echo "<td class='text-center'><strong>".htmlspecialchars($row['status_validasi'] ?? '')."</strong></td>";
                echo "<td class='text-center'><strong>".htmlspecialchars($row['status_kelulusan'] ?? '')."</strong></td>";
                
                // I. Data Pribadi
                echo "<td>".htmlspecialchars($row['nama_lengkap'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['jenis_kelamin'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nisn'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nik'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['no_kk'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['tempat_lahir'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['tanggal_lahir'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['no_registrasi_akta_lahir'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['agama_kepercayaan'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['kewarganegaraan'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['nama_negara_wna'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['kebutuhan_khusus_pd'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['alamat_jalan'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['rt'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['rw'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['nama_dusun'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['nama_kelurahan'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['kecamatan'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['kode_pos'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['tempat_tinggal'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['moda_transportasi'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['anak_keberapa'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['punya_kip'] ?? '')."</td>";

                // II. Data Ayah
                echo "<td>".htmlspecialchars($row['nama_ayah_kandung'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nik_ayah'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['tahun_lahir_ayah'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['pendidikan_ayah'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['pekerjaan_ayah'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['penghasilan_ayah'] ?? '')."</td>";

                // III. Data Ibu
                echo "<td>".htmlspecialchars($row['nama_ibu_kandung'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nik_ibu'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['tahun_lahir_ibu'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['pendidikan_ibu'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['pekerjaan_ibu'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['penghasilan_ibu'] ?? '')."</td>";

                // IV. Data Wali
                echo "<td>".htmlspecialchars($row['nama_wali'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nik_wali'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['tahun_lahir_wali'] ?? '')."</td>";

                // V. Kontak
                echo "<td class='format-text'>".htmlspecialchars($row['nomor_telepon_rumah'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nomor_hp'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['email'] ?? '')."</td>";

                // VI. Periodik & Sekolah Asal
                echo "<td class='text-center'>".htmlspecialchars($row['tinggi_badan'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['berat_badan'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['lingkar_kepala'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['waktu_tempuh_jam'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['waktu_tempuh_menit'] ?? '')."</td>";
                echo "<td class='text-center'>".htmlspecialchars($row['jumlah_saudara_kandung'] ?? '')."</td>";
                echo "<td class='format-text'>".htmlspecialchars($row['nis_asal'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['sekolah_asal'] ?? '')."</td>";

                // VII. Geografis
                echo "<td>".htmlspecialchars($row['latitude'] ?? '')."</td>";
                echo "<td>".htmlspecialchars($row['longitude'] ?? '')."</td>";
                echo "<td class='text-right'><strong>".htmlspecialchars($row['jarak_meter'] ?? 0)." m</strong></td>";
                
                echo "</tr>";
            }
            if (mysqli_num_rows($result) == 0) {
                echo "<tr><td colspan='56' style='text-align:center;font-style:italic;'>Belum ada data pendaftar di database.</td></tr>";
            }
            ?>
        </tbody>
    </table>

</body>
</html>