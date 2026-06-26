// Data Array Utama
let dataPendaftaran = JSON.parse(localStorage.getItem('spmb_data')) || [];
let currentSortPen = { key: 'peringkat_virtual', asc: true };
let currentSortOp = { key: 'id', asc: false }; // Default: Data Pendaftar Terbaru di Atas

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

// FUNGSI NAVIGASI
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
}

function cekEnterLogin(e) { if (e.key === 'Enter') loginAdmin(); }

function loginAdmin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === 'admin123') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        document.getElementById('btnLogout').style.display = 'inline-block';
        closeLogin();
        switchTab('operator');
    } else {
        showCustomAlert('Akses Ditolak', 'Password Operator Salah!', 'error');
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminLoggedIn');
    document.getElementById('btnLogout').style.display = 'none';
    showCustomAlert('Info Keluar', 'Anda telah keluar dari mode operator.', 'info');
    switchTab('pendaftaran');
}

// SISTEM GEO-LOCATION
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

// --- FUNGSI SORTING GLOBAL A-Z / ANGKA ---
function sortData(data, sortConfig) {
    return data.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortConfig.asc ? (valA - valB) : (valB - valA);
    });
}

function updateSortArrows(prefix, sortConfig, columns) {
    columns.forEach(col => {
        let span = document.getElementById(`${prefix}_${col}`);
        if (span) {
            span.innerHTML = (sortConfig.key === col) ? (sortConfig.asc ? ' &#9650;' : ' &#9660;') : '';
        }
    });
}

// SUBMIT PENDAFTARAN
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
    const dataBaru = {
        id: Date.now(),
        status_validasi: 'Belum Diperiksa',
        status_lulus: 'TIDAK DITERIMA'
    };

    for (let [key, value] of formData.entries()) {
        if (key === 'kebutuhan_khusus_pd') {
            dataBaru[key] = formData.getAll(key).join(', ');
            continue;
        }
        
        const integerFields = [
            'rt', 'rw', 'anak_keberapa', 'tahun_lahir_ayah', 'tahun_lahir_ibu', 'tahun_lahir_wali', 
            'tinggi_badan', 'berat_badan', 'lingkar_kepala', 'waktu_tempuh_jam', 'waktu_tempuh_menit', 'jumlah_saudara_kandung'
        ];
        
        if (integerFields.includes(key)) {
            dataBaru[key] = value ? Number(value) : null;
        } else {
            dataBaru[key] = value;
        }
    }

    if (!dataBaru.waktu_tempuh_jam) dataBaru.waktu_tempuh_jam = 0;
    dataBaru.jarak_meter = hitungJarak(parseFloat(dataBaru.latitude), parseFloat(dataBaru.longitude), SK_LAT, SK_LON);

    dataPendaftaran.push(dataBaru);
    localStorage.setItem('spmb_data', JSON.stringify(dataPendaftaran));

    showCustomAlert('Berhasil', 'Pendaftaran Berhasil Disimpan! Data telah masuk ke sistem.', 'success');
    this.reset();
    switchTab('pengumuman');
});

// ==========================================
// RENDER TABEL PENGUMUMAN UMUM
// ==========================================
function renderPengumumanTable() {
    const tbody = document.querySelector('#tablePengumuman tbody');
    if (!tbody) return; tbody.innerHTML = '';

    let sortedData = [...dataPendaftaran];

    // Sorting Khusus Pengumuman
    sortedData.sort((a, b) => {
        let valA = a[currentSortPen.key];
        let valB = b[currentSortPen.key];
        
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (currentSortPen.key === 'jarak_meter' || currentSortPen.key === 'peringkat_virtual') {
            valA = Number(valA); valB = Number(valB);
            return currentSortPen.asc ? valA - valB : valB - valA;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            return currentSortPen.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
    });

    // Kalkulasi peringkat
    let finalSortedData = sortedData.sort((a, b) => (a.jarak_meter || 0) - (b.jarak_meter || 0)).map((item, index) => {
        item.peringkat_virtual = index + 1; return item;
    });

    if(currentSortPen.key !== 'jarak_meter' && currentSortPen.key !== 'peringkat_virtual') {
        finalSortedData = finalSortedData.sort((a, b) => {
            let valA = a[currentSortPen.key] || "";
            let valB = b[currentSortPen.key] || "";
            return currentSortPen.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
    } else if (!currentSortPen.asc) {
        finalSortedData.reverse();
    }

    const columnsPen = ['peringkat_virtual', 'nama_lengkap', 'jarak_meter', 'status_lulus'];
    columnsPen.forEach(col => {
        let span = document.getElementById(`arrPen_${col}`);
        if (span) span.innerHTML = (currentSortPen.key === col) ? (currentSortPen.asc ? ' &#9650;' : ' &#9660;') : '';
    });

    const filterNama = document.getElementById('filterPenNamaSiswa').value.toLowerCase();
    const filterStatus = document.getElementById('filterPenStatus').value;

    let filteredData = finalSortedData.filter(item => {
        let nama = item.nama_lengkap || item.nama_siswa || "";
        const cocokNama = nama.toLowerCase().includes(filterNama);
        let statusTeksNyata = item.status_validasi === 'Belum Diperiksa' ? 'PROSES VALIDASI' : item.status_lulus;
        return cocokNama && (filterStatus === 'Semua' || statusTeksNyata === filterStatus);
    });

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        
        let statusHtml = '';
        if (item.status_validasi === 'Belum Diperiksa') {
            statusHtml = `<span class="status-proses">PROSES VALIDASI</span>`;
        } else if (item.status_lulus === 'DITERIMA') {
            statusHtml = `<span class="status-diterima">DITERIMA</span>`;
        } else if (item.status_lulus === 'DAFTAR TUNGGU') {
            statusHtml = `<span class="status-tunggu">DAFTAR TUNGGU</span>`;
        } else {
            statusHtml = `<span class="status-gagal">TIDAK DITERIMA</span>`;
        }
        
        let namaFinal = (item.nama_lengkap || item.nama_siswa || "-").toUpperCase();

        tr.innerHTML = `
            <td><b>${item.status_validasi === 'Tidak Valid' ? '-' : item.peringkat_virtual}</b></td>
            <td><b>${namaFinal}</b> (${item.jenis_kelamin === 'Laki-laki' ? 'L' : (item.jenis_kelamin === 'Perempuan' ? 'P' : '-')})<br><small>TTL: ${item.tempat_lahir || '-'}, ${item.tanggal_lahir || '-'}</small></td>
            <td>HP/WA: ${item.nomor_hp || '-'}<br>Asal: ${item.sekolah_asal || 'Tidak Ada'}</td>
            <td>${(item.jarak_meter || 0).toLocaleString('id-ID')} Meter</td>
            <td>${statusHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function doSortPen(key) {
    currentSortPen.asc = currentSortPen.key === key ? !currentSortPen.asc : true;
    currentSortPen.key = key;
    renderPengumumanTable();
}

// ==========================================
// RENDER TABEL PANEL OPERATOR DAPODIK
// ==========================================
function renderOperatorTable() {
    const tbody = document.querySelector('#tableOperator tbody');
    if (!tbody) return; tbody.innerHTML = '';

    const filterNama = document.getElementById('filterOpNama').value.toLowerCase();
    const filterStatus = document.getElementById('filterOpStatus').value;

    let filteredData = dataPendaftaran.filter(item => {
        let nama = item.nama_lengkap || item.nama_siswa || "";
        return nama.toLowerCase().includes(filterNama) && (filterStatus === 'Semua' || item.status_validasi === filterStatus);
    });

    // Logika Sorting A-Z / Angka untuk Tabel Operator (Termasuk Jarak Meter)
    filteredData.sort((a, b) => {
        let valA = a[currentSortOp.key];
        let valB = b[currentSortOp.key];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (currentSortOp.key === 'id' || currentSortOp.key === 'jarak_meter') {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
            return currentSortOp.asc ? valA - valB : valB - valA;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
            return currentSortOp.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return 0;
    });

    // Update Panah Sorting Operator
    const columnsOp = ['id', 'status_validasi', 'nama_lengkap', 'jarak_meter'];
    columnsOp.forEach(col => {
        const arrowSpan = document.getElementById(`arrOp_${col}`);
        if (arrowSpan) {
            arrowSpan.innerHTML = (currentSortOp.key === col) ? (currentSortOp.asc ? ' &#9650;' : ' &#9660;') : '';
        }
    });

    if (filteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#999;">Tidak ada berkas masuk.</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        const tr = document.createElement('tr');
        const d = new Date(item.id);
        
        let badgeValidasi = '';
        if (item.status_validasi === 'Valid') {
            if(item.status_lulus === 'DAFTAR TUNGGU') {
                badgeValidasi = `<span style="background:#0d6efd; color:white; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold;">TUNGGU</span>`;
            } else {
                badgeValidasi = `<span style="background:#28a745; color:white; padding:3px 6px; border-radius:4px; font-size:11px; font-weight:bold;">VALID</span>`;
            }
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

function doSortOp(key) {
    currentSortOp.asc = currentSortOp.key === key ? !currentSortOp.asc : true;
    currentSortOp.key = key;
    renderOperatorTable();
}

// LOGIKA VALIDASI DAN KUOTA 40 SISWA
function setValidasi(id, status) {
    let targetItem = dataPendaftaran.find(item => item.id === id);
    if(!targetItem) return;

    targetItem.status_validasi = status;
    
    if (status === 'Valid') {
        let jumlahDiterima = dataPendaftaran.filter(item => item.status_lulus === 'DITERIMA' && item.id !== id).length;
        
        if (jumlahDiterima < MAX_KUOTA) {
            targetItem.status_lulus = 'DITERIMA';
        } else {
            targetItem.status_lulus = 'DAFTAR TUNGGU'; 
        }
    } else {
        targetItem.status_lulus = 'TIDAK DITERIMA';
    }

    localStorage.setItem('spmb_data', JSON.stringify(dataPendaftaran));
    renderOperatorTable();
}

// FUNGSI HAPUS SISWA PERMANEN
function hapusSiswa(id) {
    if(confirm("Yakin hapus permanen data siswa ini? Ini akan memberikan slot bagi siswa lain.")) {
        dataPendaftaran = dataPendaftaran.filter(item => item.id !== id);
        localStorage.setItem('spmb_data', JSON.stringify(dataPendaftaran));
        showCustomAlert('Berhasil', 'Data siswa berhasil dihapus secara permanen.', 'success');
        
        renderOperatorTable();
        renderPengumumanTable(); 
    }
}

// ==========================================
// FITUR MELIHAT BERKAS (SIMULASI XAMPP)
// ==========================================
function bukaModalBerkas(id) {
    const siswa = dataPendaftaran.find(item => item.id === id);
    if(!siswa) return;

    let namaFinal = (siswa.nama_lengkap || siswa.nama_siswa || "-").toUpperCase();
    document.getElementById('namaPendaftarBerkas').innerText = `Pendaftar: ${namaFinal}`;
    
    const listContainer = document.getElementById('listBerkasContainer');
    listContainer.innerHTML = `
        <button class="btn btn-gov" style="text-align:left; background-color:#f1f5f9; color:#333; border: 1px solid #cbd5e1;" onclick="simulasiBukaFile('File Gabungan PDF/Gambar')">📄 Lihat File Unggahan Pendaftar</button>
    `;

    document.getElementById('berkasOverlay').classList.add('active');
}

function closeModalBerkas() {
    document.getElementById('berkasOverlay').classList.remove('active');
}

function simulasiBukaFile(jenisBerkas) {
    showCustomAlert('Simulasi Buka Berkas', `Anda mencoba membuka: ${jenisBerkas}. \n\nKetika digabungkan dengan XAMPP/MySQL nanti, tombol ini akan membuka tab baru berisi file PDF atau gambar yang diunggah oleh pendaftar.`, 'info');
}
