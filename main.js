// Data Array Utama (Sekarang diisi otomatis dari Database MySQL)
let dataPendaftaran = [];
let currentSortPen = { key: 'peringkat_virtual', asc: true };
let currentSortOp = { key: 'id', asc: false }; 

const MAX_KUOTA = 40;

// SISTEM POP-UP MODERN
function showCustomAlert(title, message, iconType = 'info') {
    const overlay = document.getElementById('customAlertOverlay');
    document.getElementById('customAlertTitle').innerText = title;
    document.getElementById('customAlertMessage').innerText = message;
    document.getElementById('customAlertIcon').innerText = iconType === 'success' ? '✅' : (iconType === 'error' ? '❌' : 'ℹ️');
    overlay.classList.add('active');
}

function closeCustomAlert() {
    document.getElementById('customAlertOverlay').classList.remove('active');
}

// FUNGSI LOAD DATA UTAMA DARI DATABASE MYSQL)
function muatDataPendaftaran() {
    fetch('ambil_pendaftaran.php?t=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        dataPendaftaran = data;
        
        // Setelah data dapat, Kurir MEMANGGIL Si Penyusun Rak
        renderPengumumanTable(); 
        renderOperatorTable();   // <--- INI HANYA MEMANGGIL, BUKAN BERARTI ISINYA DI SINI
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function renderOperatorTable() {
    // 1. TAMBAHKAN LOG DI SINI (Cek apakah data ada sebelum diproses)
    console.log("Cek Data Pendaftaran:", dataPendaftaran);

    const tbody = document.querySelector('#tableOperator tbody');
    if (!tbody) return; 
    tbody.innerHTML = '';

    const filterNama = document.getElementById('filterOpNama').value.toLowerCase();
    const filterStatus = document.getElementById('filterOpStatus').value;

    let filteredData = dataPendaftaran.filter(item => {
        let nama = item.nama_lengkap || item.nama_siswa || "";
        return nama.toLowerCase().includes(filterNama) && (filterStatus === 'Semua' || item.status_validasi === filterStatus);
    });

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        const d = new Date(item.id);
        
        let badgeValidasi = '';
        if (item.status_validasi === 'Valid') {
            badgeValidasi = `<span style="background:#28a745; color:white; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold;">VALID</span>`;
        } else if (item.status_validasi === 'Tidak Valid') {
            badgeValidasi = `<span style="background:#dc3545; color:white; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold;">TDK VALID</span>`;
        } else {
            badgeValidasi = `<span style="background:#ffc107; color:#333; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold;">BLM PERIKSA</span>`;
        }

        let namaFinal = (item.nama_lengkap || item.nama_siswa || "-").toUpperCase();

        tr.innerHTML = `
            <td style="min-width: 90px;">
                <small>${d.toLocaleDateString('id-ID')}<br>${d.toLocaleTimeString('id-ID')} WIB</small><br><br>
                <button class="btn btn-gov" style="padding:4px; font-size:11px; width: 100%; margin-bottom:4px; background-color:#64748b;" onclick="bukaModalBerkas(${item.id})">📂 Cek Berkas</button>
                <button class="btn btn-gov" style="padding:4px; font-size:11px; width: 100%; margin-bottom:4px;" onclick="setValidasi(${item.id}, 'Valid')">✔️ Set Valid</button>
                <button class="btn btn-danger" style="padding:4px; font-size:11px; width: 100%; margin-bottom:4px;" onclick="setValidasi(${item.id}, 'Tidak Valid')">❌ Set Gagal</button>
                <button class="btn" style="background-color: #343a40; color: white; padding:4px; font-size:11px; width: 100%;" onclick="hapusSiswa(${item.id})">🗑️ Hapus</button>
            </td>
            <td style="text-align: center;">${badgeValidasi}</td>
            <td style="min-width: 250px;">
                <b>${namaFinal}</b> (${item.jenis_kelamin || '-'})<br>
                TTL: ${item.tempat_lahir || '-'}, ${item.tanggal_lahir || '-'}<br>
                NIK: <code>${item.nik || '-'}</code> | KK: <code>${item.no_kk || '-'}</code><br>
                Akta: <code>${item.no_registrasi_akta_lahir || '-'}</code><br>
                NISN: <code>${item.nisn || '-'}</code><br>
                Agama: ${item.agama_kepercayaan || '-'}<br>
                ABK: ${item.kebutuhan_khusus_pd || 'Tidak'}
            </td>
            <td style="min-width: 250px;">
                Jl. ${item.alamat_jalan || '-'} RT ${item.rt || '-'} RW ${item.rw || '-'} Dusun ${item.nama_dusun || '-'}<br>
                Desa ${item.nama_kelurahan || '-'}, Kec. ${item.kecamatan || '-'}, Kode Pos ${item.kode_pos || '-'}<br>
                Tinggal: ${item.tempat_tinggal || '-'}<br>
                Transport: ${item.moda_transportasi || '-'}<br>
                Jarak: <b>${item.jarak_meter || 0} m</b>
            </td>
            <td style="min-width: 200px;">
                <b>Ayah: ${item.nama_ayah_kandung || '-'}</b> (${item.tahun_lahir_ayah || '-'})<br>
                NIK Ayah: <code>${item.nik_ayah || '-'}</code><br>
                Pndk: ${item.pendidikan_ayah || '-'} | Kerja: ${item.pekerjaan_ayah || '-'}<br>
                Gaji: ${item.penghasilan_ayah || '-'}
            </td>
            <td style="min-width: 200px;">
                <b>Ibu: ${item.nama_ibu_kandung || '-'}</b> (${item.tahun_lahir_ibu || '-'})<br>
                NIK Ibu: <code>${item.nik_ibu || '-'}</code><br>
                Pndk: ${item.pendidikan_ibu || '-'} | Kerja: ${item.pekerjaan_ibu || '-'}<br>
                Gaji: ${item.penghasilan_ibu || '-'}<br>
                WA: <code>${item.nomor_hp || '-'}</code>
            </td>
            <td style="min-width: 150px;">
                TB: ${item.tinggi_badan || '-'}cm | BB: ${item.berat_badan || '-'}kg<br>
                LK: ${item.lingkar_kepala || '-'}cm<br>
                Waktu: ${item.waktu_tempuh_jam || 0}j ${item.waktu_tempuh_menit || 0}m<br>
                Jml Saudara: ${item.jumlah_saudara_kandung || 0}<br>
                Asal: ${item.sekolah_asal || '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// FUNGSI NAVIGASI
function switchTab(tabId) {
    document.getElementById('pendaftaran').style.display = tabId === 'pendaftaran' ? 'block' : 'none';
    document.getElementById('pengumuman').style.display = tabId === 'pengumuman' ? 'block' : 'none';
    document.getElementById('operator').style.display = tabId === 'operator' ? 'block' : 'none';
    
    if (tabId === 'pengumuman' || tabId === 'operator') {
        muatDataPendaftaran();
    }
}

window.onload = function() {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        document.getElementById('btnLogout').style.display = 'inline-block';
    }
    muatDataPendaftaran();
};

function openProtectedPage(tabId) {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        switchTab(tabId);
    } else {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('username').focus();
    }
}

function closeLogin() {
    document.getElementById('loginOverlay').style.display = 'none';
}

function cekEnterLogin(e) { if (e.key === 'Enter') loginAdmin(); }

// LOGIN OPERATOR TERINTEGRASI PHP
function loginAdmin() {
    const userInp = document.getElementById('username').value.trim();
    const passInp = document.getElementById('password').value.trim();

    if (!userInp || !passInp) {
        showCustomAlert('Peringatan', 'Username dan password harus diisi!', 'error');
        return;
    }

    let formData = new FormData();
    formData.append('username', userInp);
    formData.append('password', passInp);

    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            sessionStorage.setItem('isAdminLoggedIn', 'true'); 
            document.getElementById('btnLogout').style.display = 'inline-block';
            closeLogin();
            switchTab('operator');
            showCustomAlert('Berhasil', 'Selamat datang, Admin!', 'success');
            
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            showCustomAlert('Gagal', data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showCustomAlert('Error', 'Gagal terhubung ke server database.', 'error');
    });
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminLoggedIn');
    document.getElementById('btnLogout').style.display = 'none';
    showCustomAlert('Info Keluar', 'Anda telah keluar dari mode operator.', 'info');
    switchTab('pendaftaran');
}

// SISTEM GEO-LOCATION ZONASI
const SK_LAT = -7.028461; 
const SK_LON = 107.527443;

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const deltaPhi = (lat2-lat1) * Math.PI/180;
    const deltaLambda = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    return Math.round(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))));
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('latitude').value = position.coords.latitude.toFixed(6);
                document.getElementById('longitude').value = position.coords.longitude.toFixed(6);
                showCustomAlert('Berhasil', 'Koordinat GPS berhasil diambil otomatis!', 'success');
            },
            () => { showCustomAlert('GPS Lemah', 'Gagal mengambil GPS otomatis. Silakan isi manual.', 'info'); }
        );
    }
}

// SUBMIT FORMULIR PENDAFTARAN BARU
document.getElementById('formPendaftaran').addEventListener('submit', function(e) {
    e.preventDefault();

    const birthDate = new Date(document.getElementById('tanggal_lahir').value);
    const targetDate = new Date('2026-07-01');
    let age = targetDate.getFullYear() - birthDate.getFullYear();
    if (targetDate.getMonth() < birthDate.getMonth() || (targetDate.getMonth() === birthDate.getMonth() && targetDate.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 6) {
        showCustomAlert('Pendaftaran Ditolak', `Umur calon siswa baru ${age} tahun per 1 Juli 2026. Minimal harus berusia 6 tahun.`, 'error');
        return;
    }

    const formData = new FormData(this);
    const lat = parseFloat(document.getElementById('latitude').value);
    const lon = parseFloat(document.getElementById('longitude').value);
    const jarak = hitungJarak(lat, lon, SK_LAT, SK_LON);
    
    formData.append('jarak_meter', jarak);

    fetch('simpan_pendaftaran.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showCustomAlert('Berhasil', data.message, 'success');
            document.getElementById('formPendaftaran').reset();
            muatDataPendaftaran();
            switchTab('pengumuman');
        } else {
            showCustomAlert('Gagal', data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showCustomAlert('Error', 'Gagal terhubung ke database lokal.', 'error');
    });
});

// RENDER TABEL PENGUMUMAN SELEKSI (UMUM)
function renderPengumumanTable() {
    const tbody = document.querySelector('#tablePengumuman tbody');
    if (!tbody) return; 
    tbody.innerHTML = '';

    // Data handling
    let sortedData = [...dataPendaftaran];
    // Sort logic (berdasarkan jarak_meter)
    sortedData.sort((a, b) => (a.jarak_meter || 0) - (b.jarak_meter || 0)).forEach((item, index) => {
        item.peringkat_virtual = index + 1;
    });

    const filterNama = document.getElementById('filterPenNamaSiswa').value.toLowerCase();
    const filterStatus = document.getElementById('filterPenStatus').value;

    let filteredData = sortedData.filter(item => {
        let nama = item.nama_lengkap || "";
        const cocokNama = nama.toLowerCase().includes(filterNama);
        
        // Tentukan teks status untuk filter
        let statusTeksUmum = 'PROSES VALIDASI';
        if (item.status_validasi === 'Valid' && item.status_kelulusan === 'DITERIMA') statusTeksUmum = 'DITERIMA';
        else if (item.status_validasi === 'Valid' && item.status_kelulusan === 'TIDAK DITERIMA') statusTeksUmum = 'TIDAK DITERIMA';
        
        return cocokNama && (filterStatus === 'Semua' || statusTeksUmum === filterStatus);
    });

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        
        // LOGIKA STATUS TAMPILAN
        let statusHtml = '';
        if (item.status_validasi === 'Belum Diperiksa') {
            statusHtml = `<span class="status-proses">PROSES VALIDASI</span>`;
        } else if (item.status_kelulusan === 'DITERIMA') {
            statusHtml = `<span class="status-diterima">DITERIMA</span>`;
        } else if (item.status_kelulusan === 'TIDAK DITERIMA') {
            statusHtml = `<span class="status-gagal">TIDAK DITERIMA</span>`;
        } else {
            statusHtml = `<span class="status-proses">PROSES VALIDASI</span>`;
        }
        
        let namaFinal = (item.nama_lengkap || "-").toUpperCase();

        tr.innerHTML = `
            <td><b>${item.peringkat_virtual}</b></td>
            <td><b>${namaFinal}</b> (${item.jenis_kelamin?.charAt(0) || '-'})<br><small>TTL: ${item.tempat_lahir || '-'}, ${item.tanggal_lahir || '-'}</small></td>
            <td>HP/WA: ${item.nomor_hp || '-'}<br>Asal: ${item.sekolah_asal || 'Tidak Ada'}</td>
            <td>${(item.jarak_meter || 0).toLocaleString('id-ID')} Meter</td>
            <td>${statusHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}


function doSortOp(key) {
    currentSortOp.asc = currentSortOp.key === key ? !currentSortOp.asc : true;
    currentSortOp.key = key;
    renderOperatorTable();
}

// UPDATE STATUS VALIDASI LANGSUNG KE MYSQL DATABASE
function setValidasi(id, status) {
    let formData = new FormData();
    formData.append('id', id);
    formData.append('status_validasi', status); 

    fetch('update_status.php', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showCustomAlert('Berhasil', 'Status berhasil diperbarui!', 'success');
            muatDataPendaftaran(); 
        } else {
            showCustomAlert('Gagal', data.message, 'error');
        }
    });
}

// FUNGSI HAPUS MODERN
function hapusPendaftaran(id) {
    document.getElementById('customConfirmOverlay').classList.add('active');
    
    document.getElementById('btnConfirmDelete').onclick = function() {
        let formData = new FormData();
        formData.append('id', id);

        fetch('hapus_pendaftaran.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            closeCustomConfirm(); 
            if (data.status === 'success') {
                showCustomAlert('Berhasil', data.message, 'success');
                muatDataPendaftaran(); 
            } else {
                showCustomAlert('Gagal', data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            closeCustomConfirm();
            showCustomAlert('Error', 'Gagal terhubung ke database.', 'error');
        });
    };
}

function closeCustomConfirm() {
    document.getElementById('customConfirmOverlay').classList.remove('active');
}

// MODAL CEK BERKAS UNGGAHAN
function bukaModalBerkas(id) {
    // Menggunakan '==' toleran terhadap perbedaan tipe data string/number
    const siswa = dataPendaftaran.find(item => item.id == id);
    if (!siswa) return;

    let namaFinal = (siswa.nama_lengkap || "-").toUpperCase();
    document.getElementById('namaPendaftarBerkas').innerText = `Pendaftar: ${namaFinal}`;
    
    const listContainer = document.getElementById('listBerkasContainer');
    
    if (siswa.berkas_digital) {
        listContainer.innerHTML = `
            <a href="uploads/${siswa.berkas_digital}" target="_blank" class="btn btn-gov" style="text-align:center; display:block; background-color:#2563eb; color:white; text-decoration:none; padding:10px; border-radius:6px; font-weight:bold;">
                📄 Buka / Unduh Dokumen (${siswa.berkas_digital})
            </a>
        `;
    } else {
        listContainer.innerHTML = `
            <p style="color:#dc3545; text-align:center; font-weight:bold;">⚠️ Berkas tidak ditemukan atau belum diunggah.</p>
        `;
    }

    document.getElementById('berkasOverlay').classList.add('active');
}

function closeModalBerkas() {
    document.getElementById('berkasOverlay').classList.remove('active');
}

// INISIALISASI GOOGLE MAPS
function initMap() {
    console.log("Google Maps berhasil dimuat dan siap digunakan!");
}

window.initMap = initMap;

