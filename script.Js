/* ==========================================
   OPTIMASI PEMBAGIAN BEBAN 3 FASA
   IMPLEMENTASI MATRIKS BERBASIS WEB
========================================== */


/* ==========================================
   1. MEMULAI APLIKASI
========================================== */

function mulaiOptimasi() {

    const landingPage = document.getElementById("landingPage");
    const application = document.getElementById("application");

    landingPage.style.display = "none";
    application.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ==========================================
   2. MEMBACA DATA BEBAN
========================================== */

function ambilDataBeban() {

    const rows = document.querySelectorAll("#loadBody tr");

    const loads = [];

    rows.forEach((row) => {

        const nama =
            row.querySelector(".load-name").value.trim();

        const daya =
            Number(row.querySelector(".load-power").value);

        const fasa =
            row.querySelector(".load-phase").value;

        if (nama !== "" && daya > 0) {

            loads.push({
                nama: nama,
                daya: daya,
                fasaAwal: fasa
            });

        }

    });

    return loads;
}


/* ==========================================
   3. MENAMBAHKAN BARIS BEBAN
========================================== */

function tambahBaris() {

    const tbody =
        document.getElementById("loadBody");

    const nomor =
        tbody.querySelectorAll("tr").length + 1;

    const row =
        document.createElement("tr");

    row.innerHTML = `

        <td>${nomor}</td>

        <td>
            <input
                type="text"
                class="load-name"
                placeholder="Nama Beban"
            >
        </td>

        <td>
            <input
                type="number"
                class="load-power"
                placeholder="Daya"
                min="0"
            >
        </td>

        <td>

            <select class="load-phase">

                <option value="R">R</option>
                <option value="S">S</option>
                <option value="T">T</option>

            </select>

        </td>

        <td>

            <button
                class="delete-btn"
                onclick="hapusBaris(this)"
            >
                Hapus
            </button>

        </td>

    `;

    tbody.appendChild(row);

    perbaruiNomor();

}


/* ==========================================
   4. MENGHAPUS BARIS BEBAN
========================================== */

function hapusBaris(button) {

    const row =
        button.closest("tr");

    row.remove();

    perbaruiNomor();

}


/* ==========================================
   5. MEMPERBARUI NOMOR TABEL
========================================== */

function perbaruiNomor() {

    const rows =
        document.querySelectorAll("#loadBody tr");

    rows.forEach((row, index) => {

        row.cells[0].textContent =
            index + 1;

    });

}


/* ==========================================
   6. FUNGSI UTAMA OPTIMASI
========================================== */

function optimasi() {

    const loads =
        ambilDataBeban();


    /* Validasi */

    if (loads.length === 0) {

        alert(
            "Silakan masukkan minimal satu data beban."
        );

        return;
    }


    if (loads.length < 3) {

        alert(
            "Masukkan minimal 3 beban agar pembagian tiga fasa dapat dianalisis."
        );

        return;
    }


    /* ======================================
       TOTAL DAYA
    ====================================== */

    const totalPower =
        loads.reduce(
            (total, load) => total + load.daya,
            0
        );


    /* ======================================
       RATA-RATA IDEAL
    ====================================== */

    const average =
        totalPower / 3;


    /* ======================================
       PENCARIAN KOMBINASI OPTIMAL
       
       Setiap beban dicoba ditempatkan
       pada fasa R, S, atau T.
    ====================================== */

    let bestResult = null;

    const jumlahBeban =
        loads.length;


    function cariKombinasi(index, pembagian) {

        if (index === jumlahBeban) {

            const totalR =
                pembagian.R.reduce(
                    (sum, i) => sum + loads[i].daya,
                    0
                );

            const totalS =
                pembagian.S.reduce(
                    (sum, i) => sum + loads[i].daya,
                    0
                );

            const totalT =
                pembagian.T.reduce(
                    (sum, i) => sum + loads[i].daya,
                    0
                );


            const deviasiR =
                Math.abs(totalR - average);

            const deviasiS =
                Math.abs(totalS - average);

            const deviasiT =
                Math.abs(totalT - average);


            const maxDeviation =
                Math.max(
                    deviasiR,
                    deviasiS,
                    deviasiT
                );


            if (
                bestResult === null ||
                maxDeviation < bestResult.maxDeviation
            ) {

                bestResult = {

                    R: [...pembagian.R],
                    S: [...pembagian.S],
                    T: [...pembagian.T],

                    totalR: totalR,
                    totalS: totalS,
                    totalT: totalT,

                    maxDeviation: maxDeviation

                };

            }

            return;
        }


        /* Masukkan beban ke R */

        pembagian.R.push(index);

        cariKombinasi(
            index + 1,
            pembagian
        );

        pembagian.R.pop();


        /* Masukkan beban ke S */

        pembagian.S.push(index);

        cariKombinasi(
            index + 1,
            pembagian
        );

        pembagian.S.pop();


        /* Masukkan beban ke T */

        pembagian.T.push(index);

        cariKombinasi(
            index + 1,
            pembagian
        );

        pembagian.T.pop();

    }


    cariKombinasi(
        0,
        {
            R: [],
            S: [],
            T: []
        }
    );


    /* ======================================
       MENAMPILKAN HASIL FASA
    ====================================== */

    document.getElementById("phaseR").textContent =
        formatWatt(bestResult.totalR);

    document.getElementById("phaseS").textContent =
        formatWatt(bestResult.totalS);

    document.getElementById("phaseT").textContent =
        formatWatt(bestResult.totalT);


    document.getElementById("totalPower").textContent =
        formatWatt(totalPower) + " W";


    document.getElementById("averagePower").textContent =
        formatWatt(average) + " W";


    document.getElementById("maxDeviation").textContent =
        formatWatt(bestResult.maxDeviation) + " W";


    /* ======================================
       STATUS KESEIMBANGAN
    ====================================== */

    const status =
        document.getElementById("balanceStatus");


    if (bestResult.maxDeviation === 0) {

        status.textContent =
            "✓ Pembagian beban sangat seimbang. Setiap fasa memiliki beban yang sama.";

    } else {

        status.textContent =
            "Pembagian beban telah dioptimalkan dengan deviasi maksimum "
            + formatWatt(bestResult.maxDeviation)
            + " W.";

    }


    /* ======================================
       TABEL REKOMENDASI
    ====================================== */

    tampilkanRekomendasi(
        loads,
        bestResult
    );


    /* ======================================
       MATRIKS
    ====================================== */

    tampilkanMatriks(
        loads,
        bestResult
    );


    /* Scroll menuju hasil */

    document.getElementById("phaseR")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


/* ==========================================
   7. FORMAT ANGKA
========================================== */

function formatWatt(value) {

    return Number(value)
        .toLocaleString("id-ID", {
            maximumFractionDigits: 2
        });

}


/* ==========================================
   8. MENAMPILKAN REKOMENDASI
========================================== */

function tampilkanRekomendasi(
    loads,
    result
) {

    const tbody =
        document.getElementById(
            "recommendationBody"
        );


    tbody.innerHTML = "";


    loads.forEach((load, index) => {

        let fasaRekomendasi = "";


        if (result.R.includes(index)) {

            fasaRekomendasi = "R";

        } else if (result.S.includes(index)) {

            fasaRekomendasi = "S";

        } else if (result.T.includes(index)) {

            fasaRekomendasi = "T";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${load.nama}
            </td>

            <td>
                ${formatWatt(load.daya)}
            </td>

            <td>
                <strong>
                    ${load.fasaAwal}
                </strong>
            </td>

            <td>
                <strong>
                    ${fasaRekomendasi}
                </strong>
            </td>

        `;


        tbody.appendChild(row);

    });

}


/* ==========================================
   9. MEMBENTUK VEKTOR P
========================================== */

function buatVektorBeban(loads) {

    const nilai =
        loads.map(
            load => load.daya
        );


    return "[" +
        nilai.join(", ") +
        "]ᵀ";

}


/* ==========================================
   10. MEMBENTUK MATRIKS A
========================================== */

function buatMatriksA(
    loads,
    result
) {

    const matrix = [];


    loads.forEach((load, index) => {

        let row;


        if (result.R.includes(index)) {

            row = [1, 0, 0];

        } else if (result.S.includes(index)) {

            row = [0, 1, 0];

        } else {

            row = [0, 0, 1];

        }


        matrix.push(row);

    });


    return matrix;

}


/* ==========================================
   11. MENAMPILKAN MATRIKS
========================================== */

function tampilkanMatriks(
    loads,
    result
) {

    const vector =
        buatVektorBeban(loads);


    const matrix =
        buatMatriksA(
            loads,
            result
        );


    const matrixText =
        matrix
            .map(
                row =>
                    "[ " +
                    row.join("   ") +
                    " ]"
            )
            .join("\n");


    const hasil =
        `[ ${result.totalR} ]\n` +
        `[ ${result.totalS} ]\n` +
        `[ ${result.totalT} ]`;


    document.getElementById(
        "loadVector"
    ).textContent = vector;


    document.getElementById(
        "assignmentMatrix"
    ).textContent = matrixText;


    document.getElementById(
        "matrixResult"
    ).textContent = hasil;

}