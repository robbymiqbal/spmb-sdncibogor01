// Array penampung data pendaftaran global (Simulasi database lokal)
let dataPendaftaran = JSON.parse(localStorage.getItem('spmb_data')) || [];
let currentSortPen = { key: 'peringkat_virtual', asc: true };
let currentSortOp = { key: 'id', asc: true };

// Fungsi Modal Alert Kustom Modern
function showCustomAlert(title, message, type = 'success') {
    const overlay = document.getElementById('customAlertOverlay');
    const txtTitle = document.getElementById('customAlertTitle');
    const txtMsg = document.getElementById('customAlertMessage');
    const divIcon = document.getElementById('customAlertIcon');

    txtTitle.innerText = title;
    txtMsg.innerText = message;

    if (type === 'success') {
        divIcon.innerText = '✅';
    } else if (type === 'error') {
        divIcon.innerText = '❌';
    } else {
        divIcon.innerText = 'ℹ️';
    }

    overlay.style.display = 'flex';
}

function closeCustomAlert() {
    document.getElementById('customAlertOverlay').style.display = 'none';
}

// Fungsi ganti tab/halaman utama
function switchTab(tabId) {
    document.getElementById('pendaftaran').style.display = tabId === 'pendaftaran' ? 'block' : 'none';
    document.getElementById('pengumuman').style.display = tabId === 'pengumuman' ? 'block' : 'none';
    document.getElementById('operator').style.display = tabId === 'operator' ? 'block' : 'none';
    
    if (tabId === 'pengumuman') renderPengumumanTable();
    if (tabId === 'operator') renderOperatorTable();
}

window.onload = function() {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        document.getElementById('btnLogout').style.display = 'inline-block';
    }
    renderPengumumanTable();
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
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function cekEnterLogin(e) {
    if (e.key === 'Enter') loginAdmin();
}

function loginAdmin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (u === 'admin' && p === 'admin123') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        document.getElementById('btnLogout').style.display = 'inline-block';
        closeLogin();
        switchTab('operator');
    } else {
        showCustomAlert('Akses Ditolak', 'Username atau Password Operator Salah!', 'error');
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminLoggedIn');
    document.getElementById('btnLogout').style.display = 'none';
    showCustomAlert('Info Logout', 'Anda telah keluar dari mode operator.', 'info');
    switchTab('pendaftaran');
}

// Koordinat Geokordinat Sekolah SDN Cibogor 01
const SK_LAT = -7.028461; 
const SK_LON = 107.527443;

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const deltaPhi = (lat2-lat1) * Math.PI/180;
    const deltaLambda = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('latitude').value = position.coords.latitude.toFixed(6);
                document.getElementById('longitude').value = position.coords.longitude.toFixed(6);
                showCustomAlert('Berhasil', 'Koordinat GPS berhasil diambil otomatis!', 'success');
            },
            () => {
                showCustomAlert('GPS Lemah', 'Gagal mengambil GPS otomatis. Silakan isi koordinat secara manual.', 'info');
            }
        );
    } else {
        showCustomAlert('Not Supported', 'Browser Anda tidak mendukung fitur GPS.', 'error');
    }
}

// Submit Pendaftaran + Validasi Umur Minimal 6 Tahun per 1 Juli 2026
document.getElementById('formPendaftaran').addEventListener('submit', function(e) {
    e.preventDefault();

    const tglLahirInput = document.getElementById('tanggal_lahir').value;
    if (!tglLahirInput) return;

    // VALIDASI MATEMATIS UMUR PER 1 JULI 2026
    const birthDate = new Date(tglLahirInput);
    const targetDate = new Date('2026-07-01');

    let age = targetDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = targetDate.getMonth() - birthDate.getMonth();
    const dayDiff = targetDate.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    if (age < 6) {
        showCustomAlert(
            'Pendaftaran Ditolak', 
            `Umur calon siswa baru ${age} tahun per 1 Juli 2026. Berdasarkan aturan, syarat pendaftaran minimal genap berusia 6 tahun.`, 
            'error'
        );
        return;
    }

    const latMhs = parseFloat(document.getElementById('latitude').value);
    const lonMhs = parseFloat(document.getElementById('longitude').value);
    const jarak = hitungJarak(latMhs, lonMhs, SK_LAT, SK_LON);

    const dataBaru = {
        id: Date.now(),
        nik: document.getElementById('nik').value,
        nama_siswa: document.getElementById('nama_siswa').value,
        nisn: document.getElementById('nisn').value || '-',
        tempat_lahir: document.getElementById('tempat_lahir').value,
        tanggal_lahir: tglLahirInput,
        nama_ayah: document.getElementById('nama_ayah').value,
        nama_ibu: document.getElementById('nama_ibu').value,
        penghasilan: parseInt(document.getElementById('penghasilan').value),
        jarak_meter: jarak,
        status_validasi: 'Belum Diperiksa',
        status_lulus: 'TIDAK DITERIMA'
    };

    dataPendaftaran.push(dataBaru);
    localStorage.setItem('spmb_data', JSON.stringify(dataPendaftaran));

    showCustomAlert('Berhasil', 'Pendaftaran Berhasil Disimpan! Silakan cek menu Hasil Penerimaan.', 'success');
    this.reset();
    switchTab('pengumuman');
});

// ==========================================
// RENDER TABEL PENGUMUMAN (UNTUK UMUM / ORANG TUA)
// ==========================================
function renderPengumumanTable() {
    const tbody = document.querySelector('#tablePengumuman tbody');
    tbody.innerHTML = '';

    let sortedData = [...dataPendaftaran].sort((a, b) => a.jarak_meter - b.jarak_meter);
    
    sortedData = sortedData.map((item, index) => {
        item.peringkat_virtual = index + 1;
        return item;
    });

    const filterNama = document.getElementById('filterPenNamaSiswa').value.toLowerCase();
    const filterStatus = document.getElementById('filterPenStatus').value;

    let filteredData = sortedData.filter(item => {
        const cocokNama = item.nama_siswa.toLowerCase().includes(filterNama);
        
        let statusTeksNyata = item.status_lulus;
        if (item.status_validasi === 'Belum Diperiksa') {
            statusTeksNyata = 'PROSES VALIDASI';
        }

        const cocokStatus = (filterStatus === 'Semua') || (statusTeksNyata === filterStatus);
        return cocokNama && cocokStatus;
    });

    filteredData.sort((a, b) => {
        let valA = a[currentSortPen.key];
        let valB = b[currentSortPen.key];

        if (typeof valA === 'string') {
            return currentSortPen.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return currentSortPen.asc ? valA - valB : valB - valA;
        }
    });

    updateSortArrowsPen();

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">Tidak ada data pendaftar yang cocok.</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        const tr = document.createElement('tr');

        let statusHtml = '';
        if (item.status_validasi === 'Belum Diperiksa') {
            statusHtml = `<span class="status-proses">PROSES VALIDASI</span>`;
        } else if (item.status_lulus === 'DITERIMA') {
            statusHtml = `<span class="status-diterima">DITERIMA</span>`;
        } else {
            statusHtml = `<span class="status-gagal">TIDAK DITERIMA</span>`;
        }

        let peringkatTeks = item.status_validasi === 'Tidak Valid' ? '-' : item.peringkat_virtual;

        tr.innerHTML = `
            <td><b>${peringkatTeks}</b></td>
            <td><b>${item.nama_siswa.toUpperCase()}</b><br><small style="color:#666;">TTL: ${item.tempat_lahir}, ${item.tanggal_lahir}</small></td>
            <td>Ayah: ${item.nama_ayah}<br>Ibu: ${item.nama_ibu}</td>
            <td>${item.jarak_meter.toLocaleString('id-ID')} Meter</td>
            <td>${statusHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function doSortPen(key) {
    if (currentSortPen.key === key) {
        currentSortPen.asc = !currentSortPen.asc;
    } else {
        currentSortPen.key = key;
        currentSortPen.asc = true;
    }
    renderPengumumanTable();
}

function updateSortArrowsPen() {
    const columns = ['peringkat_virtual', 'nama_siswa', 'jarak_meter', 'status_lulus'];
    columns.forEach(col => {
        const span = document.getElementById(`arrPen_${col}`);
        if (!span) return;
        if (currentSortPen.key === col) {
            span.className = 'active-arrow';
            span.innerText = currentSortPen.asc ? '▲' : '▼';
        } else {
            span.className = 'inactive-arrow';
            span.innerText = '▲▼';
        }
    });
}

// ==========================================
// RENDER TABEL PANEL VERIFIKASI (UNTUK ADMIN)
// ==========================================
function renderOperatorTable() {
    const tbody = document.querySelector('#tableOperator tbody');
    tbody.innerHTML = '';

    const filterNama = document.getElementById('filterOpNama').value.toLowerCase();
    const filterStatus = document.getElementById('filterOpStatus').value;

    let filteredData = dataPendaftaran.filter(item => {
        const cocokNama = item.nama_siswa.toLowerCase().includes(filterNama);
        const cocokStatus = (filterStatus === 'Semua') || (item.status_validasi === filterStatus);
        return cocokNama && cocokStatus;
    });

    filteredData.sort((a, b) => {
        let valA = a[currentSortOp.key];
        let valB = b[currentSortOp.key];

        if (typeof valA === 'string') {
            return currentSortOp.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return currentSortOp.asc ? valA - valB : valB - valA;
        }
    });

    updateSortArrowsOp();

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999;">Tidak ada berkas masuk.</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        const waktuDaftar = new Date(item.id).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) + ' WIB';

        let badgeValidasi = '';
        if (item.status_validasi === 'Valid') {
            badgeValidasi = `<span style="background:#28a745; color:white; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">VALID (DITERIMA)</span>`;
        } else if (item.status_validasi === 'Tidak Valid') {
            badgeValidasi = `<span style="background:#dc3545; color:white; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">TIDAK VALID</span>`;
        } else {
            badgeValidasi = `<span style="background:#ffc107; color:#333; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold;">BELUM DIPERIKSA</span>`;
        }

        tr.innerHTML = `
            <td><small>${waktuDaftar}</small></td>
            <td><code>${item.nik}</code><br><small style="color:#555;">NISN: ${item.nisn}</small></td>
            <td><b>${item.nama_siswa.toUpperCase()}</b><br><small style="color:#0056b3; cursor:pointer;" onclick="showCustomAlert('Simulasi Berkas', 'Membuka file simulasi berkas digital milik: ${item.nama_siswa}', 'info')">📄 Lihat Berkas Dokumen</small></td>
            <td>${item.jarak_meter.toLocaleString('id-ID')} m</td>
            <td>${badgeValidasi}</td>
            <td>
                <button class="btn btn-gov" style="padding:5px 10px; font-size:12px; margin-right:4px;" onclick="setValidasi(${item.id}, 'Valid')">Set Valid</button>
                <button class="btn btn-danger" style="padding:5px 10px; font-size:12px;" onclick="setValidasi(${item.id}, 'Tidak Valid')">Set Gagal</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function setValidasi(id, status) {
    dataPendaftaran = dataPendaftaran.map(item => {
        if (item.id === id) {
            item.status_validasi = status;
            item.status_lulus = (status === 'Valid') ? 'DITERIMA' : 'TIDAK DITERIMA';
        }
        return item;
    });
    localStorage.setItem('spmb_data', JSON.stringify(dataPendaftaran));
    renderOperatorTable();
}

// Sorting Kolom Operator Panel
function doSortOp(key) {
    if (currentSortOp.key === key) {
        currentSortOp.asc = !currentSortOp.asc;
    } else {
        currentSortOp.key = key;
        currentSortOp.asc = true;
    }
    renderOperatorTable();
}

function updateSortArrowsOp() {
    const columns = ['id', 'nama_siswa', 'jarak_meter', 'status_validasi'];
    columns.forEach(col => {
        const span = document.getElementById(`arrOp_${col}`);
        if (!span) return;
        if (currentSortOp.key === col) {
            span.className = 'active-arrow';
            span.innerText = currentSortOp.asc ? '▲' : '▼';
        } else {
            span.className = 'inactive-arrow';
            span.innerText = '▲▼';
        }
    });
}
