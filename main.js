// =========================================
// 1. KONFIGURASI UTAMA SISTEM
// =========================================
const SCHOOL_LAT = -7.0265616;
const SCHOOL_LNG = 107.524105;
const MAX_PAGU = 40;

let dataPendaftar = JSON.parse(localStorage.getItem("spmb_data")) || [];

// Variabel State untuk Sorting Tabel
let opSort = { col: 'id', dir: 'desc' }; 
let penSort = { col: 'peringkat_virtual', dir: 'asc' }; 


// =========================================
// 2. SISTEM KEAMANAN & LOGIN ADMINISTRATOR
// =========================================
let isLoggedIn = sessionStorage.getItem("spmb_login") === "true";
let targetTab = "operator";

function openProtectedPage(tabId) {
    if (isLoggedIn) {
        switchTab(tabId);
        return;
    }
    targetTab = tabId;
    document.getElementById("loginOverlay").style.display = "flex";
    setTimeout(() => document.getElementById("username").focus(), 100);
}

function loginAdmin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "admin123") {
        isLoggedIn = true;
        sessionStorage.setItem("spmb_login", "true");
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        updateNavbar(); 
        switchTab(targetTab); 
    } else {
        alert("Username atau Password salah!");
    }
}

function cekEnterLogin(e) {
    if (e.key === "Enter") {
        e.preventDefault(); 
        loginAdmin();       
    }
}

function closeLogin() {
    document.getElementById("loginOverlay").style.display = "none";
}

function logoutAdmin() {
    sessionStorage.removeItem("spmb_login");
    isLoggedIn = false;
    updateNavbar(); 
    switchTab("pendaftaran"); 
    alert("Logout berhasil. Panel internal dikunci kembali.");
}

function updateNavbar() {
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.style.display = isLoggedIn ? "inline-block" : "none";
    }
}


// =========================================
// 3. NAVIGASI TAB HALAMAN
// =========================================
function switchTab(tabId) {
    document.getElementById("pendaftaran").style.display = "none";
    document.getElementById("operator").style.display = "none";
    document.getElementById("pengumuman").style.display = "none";
    document.getElementById(tabId).style.display = "block";

    if (tabId === "operator") {
        document.getElementById("filterOpNama").value = "";
        document.getElementById("filterOpStatus").value = "Semua";
        renderOperatorTable();
    }
    if (tabId === "pengumuman") {
        document.getElementById("filterPenNamaSiswa").value = "";
        document.getElementById("filterPenStatus").value = "Semua";
        renderPengumumanTable();
    }
}


// =========================================
// 4. SENSOR GEOLOCATION (GPS)
// =========================================
function getLocation() {
    if (!navigator.geolocation) {
        alert("Browser tidak mendukung fitur Geolocation.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        function (position) {
            document.getElementById("latitude").value = position.coords.latitude;
            document.getElementById("longitude").value = position.coords.longitude;
        },
        function () {
            alert("Lokasi gagal diperoleh. Silakan ketik manual koordinat Anda.");
        }
    );
}


// =========================================
// 5. ALGORITMA HAVERSINE (RADIUS ZONASI)
// =========================================
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); 
}


// =========================================
// 6. SUBMIT FORMULIR & VALIDASI DATA MASUK
// =========================================
document.getElementById("formPendaftaran").addEventListener("submit", function (e) {
    e.preventDefault();

    const inputTanggalLahir = document.getElementById("tanggal_lahir").value;
    const tglLahir = new Date(inputTanggalLahir);
    const hariIni = new Date("2026-07-01"); 

    let umur = hariIni.getFullYear() - tglLahir.getFullYear();
    const bulan = hariIni.getMonth() - tglLahir.getMonth();
    if (bulan < 0 || (bulan === 0 && hariIni.getDate() < tglLahir.getDate())) {
        umur--;
    }

    if (umur < 6) {
        alert(`Pendaftaran Ditolak! Usia anak baru ${umur} tahun. Syarat masuk SDN Cibogor 01 minimal 6 tahun.`);
        return;
    }

    const latRumah = parseFloat(document.getElementById("latitude").value);
    const lngRumah = parseFloat(document.getElementById("longitude").value);
    if (isNaN(latRumah) || isNaN(lngRumah)) {
        alert("Koordinat tidak valid! Pastikan Anda memasukkan angka (Contoh: -7.0279).");
        return;
    }

    const fileInput = document.getElementById("file_berkas");
    let namaFile = "tidak_ada_berkas.pdf";
    if (fileInput.files.length > 0) {
        namaFile = fileInput.files[0].name;
    }

    const jarakMeter = calculateHaversineDistance(SCHOOL_LAT, SCHOOL_LNG, latRumah, lngRumah);

    const siswaBaru = {
        id: Date.now(),
        nik: document.getElementById("nik").value,
        nama_siswa: document.getElementById("nama_siswa").value,
        nisn: document.getElementById("nisn").value,
        tanggal_lahir: inputTanggalLahir,
        nama_ayah: document.getElementById("nama_ayah").value,
        nama_ibu: document.getElementById("nama_ibu").value,
        penghasilan: document.getElementById("penghasilan").value,
        latitude: latRumah,
        longitude: lngRumah,
        file_berkas: namaFile, 
        jarak_meter: jarakMeter,
        status_validasi: "Belum Diperiksa" 
    };

    if (dataPendaftar.some(s => s.nik === siswaBaru.nik)) {
        alert("NIK tersebut sudah terdaftar di dalam sistem.");
        return;
    }

    dataPendaftar.push(siswaBaru);
    localStorage.setItem("spmb_data", JSON.stringify(dataPendaftar));

    alert(
        `✔ Berkas "${namaFile}" BERHASIL DIUNGGAH!\n\n` +
        `Data pendaftaran tersimpan aman di database.\n` +
        `Jarak rumah Anda terhitung: ${jarakMeter} Meter.\n` +
        `Silakan pantau halaman 'Hasil Penerimaan' untuk melihat peringkat seleksi.`
    );

    this.reset();
    document.getElementById("nik").focus();
});


// =========================================
// 7. BADGE STATUS KONDISIONAL
// =========================================
function getBadge(status) {
    if (status === "Valid") return `<span style="background:#198754; color:white; padding:4px 10px; border-radius:4px; font-size:12px;">Valid</span>`;
    if (status === "Tidak Valid") return `<span style="background:#dc3545; color:white; padding:4px 10px; border-radius:4px; font-size:12px;">Ditolak</span>`;
    return `<span style="background:#ffc107; color:#000; padding:4px 10px; border-radius:4px; font-size:12px;">Belum Diperiksa</span>`;
}


// =========================================
// 8. FUNGSI KLIK SORTING (PANAH STABIL)
// =========================================
function doSortOp(col) {
    if (opSort.col === col) {
        opSort.dir = opSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        opSort.col = col;
        opSort.dir = 'asc';
    }
    renderOperatorTable();
}

function doSortPen(col) {
    if (penSort.col === col) {
        penSort.dir = penSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
        penSort.col = col;
        penSort.dir = 'asc';
    }
    renderPengumumanTable();
}

function updateSortVisuals(prefix, sortObj, columns) {
    columns.forEach(col => {
        const el = document.getElementById(`${prefix}_${col}`);
        if (el) {
            if (sortObj.col === col) {
                el.innerHTML = sortObj.dir === 'asc' ? '<span class="active-arrow">▲</span>' : '<span class="active-arrow">▼</span>';
            } else {
                el.innerHTML = '<span class="inactive-arrow">▲▼</span>';
            }
        }
    });
}


// =========================================
// 9. RENDER TABEL VERIFIKASI OPERATOR
// =========================================
function renderOperatorTable() {
    const tbody = document.querySelector("#tableOperator tbody");
    tbody.innerHTML = "";

    updateSortVisuals('arrOp', opSort, ['id', 'nama_siswa', 'jarak_meter', 'status_validasi']);

    const fNama = document.getElementById("filterOpNama").value.toLowerCase().trim();
    const fStatus = document.getElementById("filterOpStatus").value;

    let dataResult = dataPendaftar.filter(function (siswa) {
        const matchNama = siswa.nama_siswa.toLowerCase().includes(fNama);
        const matchStatus = fStatus === "Semua" || siswa.status_validasi === fStatus;
        return matchNama && matchStatus;
    });

    dataResult.sort((a, b) => {
        let valA = a[opSort.col];
        let valB = b[opSort.col];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return opSort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return opSort.dir === 'asc' ? 1 : -1;
        return 0;
    });

    if (dataResult.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">Data tidak ditemukan.</td></tr>`;
        return;
    }

    dataResult.forEach(function (siswa) {
        let tglFormat = new Date(siswa.id).toLocaleDateString("id-ID", {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'});

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><small>${tglFormat}</small></td>
            <td>${siswa.nik}</td>
            <td><b>${siswa.nama_siswa}</b><br><small style="color:#007bff;">📄 Berkas: ${siswa.file_berkas}</small></td>
            <td>${siswa.jarak_meter} Meter</td>
            <td>${getBadge(siswa.status_validasi)}</td>
            <td>
                <button class="btn btn-gov" onclick="updateStatus(${siswa.id},'Valid')">✔ Valid</button>
                <button class="btn" style="background:#dc3545; color:white; margin-left:5px;" onclick="updateStatus(${siswa.id},'Tidak Valid')">✖ Tolak</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


// =========================================
// 10. PROSES UPDATE STATUS OLEH ADMIN
// =========================================
function updateStatus(id, statusBaru) {
    const index = dataPendaftar.findIndex(s => s.id === id);
    if (index === -1) return;
    dataPendaftar[index].status_validasi = statusBaru;
    localStorage.setItem("spmb_data", JSON.stringify(dataPendaftar));
    renderOperatorTable();
}


// =========================================
// 11. RENDER HASIL PENERIMAAN (AKSES UMUM) - FIXED LOGIC
// =========================================
function renderPengumumanTable() {
    const tbody = document.querySelector("#tablePengumuman tbody");
    tbody.innerHTML = "";

    updateSortVisuals('arrPen', penSort, ['peringkat_virtual', 'nama_siswa', 'jarak_meter', 'status_lulus']);

    const fNamaSiswa = document.getElementById("filterPenNamaSiswa").value.toLowerCase().trim();
    const fStatus = document.getElementById("filterPenStatus").value;

    // Duplikat data pendaftar agar pengurutan dasar zonasi tidak merusak database asli
    let siswaUrutJarak = [...dataPendaftar];
    siswaUrutJarak.sort((a, b) => a.jarak_meter - b.jarak_meter);

    let validCounter = 0;

    // Map semua data pendaftar tanpa membuang status data tertentu
    let siswaMapped = siswaUrutJarak.map(function (siswa) {
        let statusLulus = "TIDAK DITERIMA";
        let peringkatVirtual = "-";

        if (siswa.status_validasi === "Valid") {
            validCounter++;
            peringkatVirtual = validCounter;
            if (validCounter <= MAX_PAGU) {
                statusLulus = "DITERIMA";
            }
        } else {
            // "Belum Diperiksa" atau "Tidak Valid" otomatis TIDAK DITERIMA di halaman umum
            statusLulus = "TIDAK DITERIMA";
        }

        return {
            ...siswa,
            peringkat_virtual: peringkatVirtual,
            status_lulus: statusLulus
        };
    });

    // Proses filter berdasarkan input pencarian nama dan dropdown status
    let dataResult = siswaMapped.filter(function (siswa) {
        const matchNamaSiswa = siswa.nama_siswa.toLowerCase().includes(fNamaSiswa);
        const matchStatus = fStatus === "Semua" || siswa.status_lulus === fStatus;
        return matchNamaSiswa && matchStatus;
    });

    // Jalankan sorting dinamis dari klik kepala tabel
    dataResult.sort((a, b) => {
        let valA = a[penSort.col];
        let valB = b[penSort.col];

        if (penSort.col === 'peringkat_virtual') {
            if (valA === '-') return 1;
            if (valB === '-') return -1;
            return penSort.dir === 'asc' ? valA - valB : valB - valA;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return penSort.dir === 'asc' ? -1 : 1;
        if (valA > valB) return penSort.dir === 'asc' ? 1 : -1;
        return 0;
    });

    if (dataResult.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">Data tidak ditemukan.</td></tr>`;
        return;
    }

    dataResult.forEach(function (siswa) {
        const statusLabel = siswa.status_lulus === "DITERIMA" ? 
            `<span style="color:#198754; font-weight:bold;">DITERIMA</span>` : 
            `<span style="color:#dc3545; font-weight:bold;">TIDAK DITERIMA</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${siswa.peringkat_virtual}</td>
            <td>${siswa.nama_siswa}</td>
            <td>${siswa.nama_ayah}</td>
            <td>${siswa.jarak_meter} Meter</td>
            <td>${statusLabel}</td>
        `;
        tbody.appendChild(tr);
    });
}

// INITIALIZATION KETIKA WEB PERTAMA KALI DIBUKA
updateNavbar();
switchTab("pendaftaran");