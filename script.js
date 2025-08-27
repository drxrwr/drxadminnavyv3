const fileColumns = document.getElementById("fileColumns");

// Buat 20 kolom file input
for (let i = 1; i <= 20; i++) {
  const box = document.createElement("div");
  box.className = "file-box";

  const filename = document.createElement("input");
  filename.placeholder = `Nama file untuk kolom ${i}`;
  filename.className = "file-name";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Isi nomor (satu per baris)";

  const button = document.createElement("button");
  button.textContent = "Download .vcf";
  button.addEventListener("click", () => {
    generateVCF(filename.value.trim(), textarea.value.trim());
  });

  box.appendChild(filename);
  box.appendChild(textarea);
  box.appendChild(button);
  fileColumns.appendChild(box);
}

function generateVCF(fileName, rawText) {
  const namaAdmin = document.getElementById("namaAdmin").value.trim();
  const namaNavy = document.getElementById("namaNavy").value.trim();
  const awal = document.getElementById("pilihanAwal").value;
  const urutan = document.getElementById("urutan").value;
  const jumlahAwal = parseInt(document.getElementById("jumlahAwal").value) || 1;

  const tambahanAdmin = document.getElementById("extraAdmin").value.trim().split('\n').filter(Boolean);
  const tambahanNavy = document.getElementById("extraNavy").value.trim().split('\n').filter(Boolean);

  let numbers = rawText
    .split('\n')
    .map(n => n.replace(/[^\d+]/g, ''))
    .map(n => n.startsWith('+') ? n : '+' + n)
    .filter(n => /^(\+\d{10,})$/.test(n));

  if (urutan === "bawah") numbers = numbers.reverse();

  const contacts = [];
  let adminCount = 0;
  let navyCount = 0;
  const isAdmin = awal === "admin";

  numbers.forEach((num, index) => {
    let label;
    if ((isAdmin && index < jumlahAwal) || (!isAdmin && index >= jumlahAwal)) {
      adminCount++;
      label = `${namaAdmin} ${adminCount}`;
    } else {
      navyCount++;
      label = `${namaNavy} ${navyCount}`;
    }
    contacts.push({ name: label, phone: num });
  });

  tambahanAdmin.forEach((n) => {
    const nomor = n.replace(/[^\d+]/g, '');
    const nomorFix = nomor.startsWith('+') ? nomor : '+' + nomor;
    if (/^(\+\d{10,})$/.test(nomorFix)) {
      adminCount++;
      contacts.push({ name: `${namaAdmin} ${adminCount}`, phone: nomorFix });
    }
  });

  tambahanNavy.forEach((n) => {
    const nomor = n.replace(/[^\d+]/g, '');
    const nomorFix = nomor.startsWith('+') ? nomor : '+' + nomor;
    if (/^(\+\d{10,})$/.test(nomorFix)) {
      navyCount++;
      contacts.push({ name: `${namaNavy} ${navyCount}`, phone: nomorFix });
    }
  });

  let vcfContent = contacts
    .map(
      (c) => `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;TYPE=CELL:${c.phone}\nEND:VCARD`
    )
    .join('\n');

  const blob = new Blob([vcfContent], { type: "text/vcard" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ADMIN NAVY ${fileName || 'contacts'}.vcf`;
  a.click();
}

// Fungsi isi otomatis
function isiOtomatis() {
  const rangeInput = document.getElementById("rangeNomor").value.trim();
  const perBagian = parseInt(document.getElementById("perBagian").value.trim());

  if (!/^(\d+)-(\d+)$/.test(rangeInput) || isNaN(perBagian) || perBagian <= 0) {
    alert("Isi format rentang dengan benar, contoh: 123-152 dan bagi per berapa.");
    return;
  }

  const [mulai, akhir] = rangeInput.split('-').map(Number);
  const total = akhir - mulai + 1;
  const fileInputs = document.querySelectorAll(".file-name");

  let counter = 0;
  for (let i = 0; i < total; i += perBagian) {
    const from = mulai + i;
    const to = Math.min(mulai + i + perBagian - 1, akhir);
    if (fileInputs[counter]) {
      fileInputs[counter].value = `${from}-${to}`;
      counter++;
    } else {
      break;
    }
  }
}

// Fungsi hapus nama file
function hapusOtomatis() {
  const fileInputs = document.querySelectorAll(".file-name");
  fileInputs.forEach(input => input.value = "");
}

// 🔹 Fungsi gabung nama file akhir (JU1, JU2, JU3 → JU1-3)
function gabungNamaFile() {
  const fileInputs = document.querySelectorAll(".file-name");
  fileInputs.forEach(input => {
    const val = input.value.trim();
    if (!val) return;

    const match = val.match(/^([A-Za-z]+)(\d+)-([A-Za-z]+)?(\d+)?$/);
    if (match) return; // sudah dalam format range

    const parts = val.match(/^([A-Za-z]+)(\d+)$/);
    if (!parts) return;

    const prefix = parts[1];
    const startNum = parseInt(parts[2]);
    let endNum = startNum;

    // cari angka terakhir yang sama prefix di bawahnya
    for (let i = input.parentElement.querySelectorAll(".file-name").length - 1; i >= 0; i--) {
      const otherVal = fileInputs[i].value.trim();
      const otherParts = otherVal.match(/^([A-Za-z]+)(\d+)$/);
      if (otherParts && otherParts[1] === prefix) {
        endNum = parseInt(otherParts[2]);
        break;
      }
    }

    if (endNum !== startNum) {
      input.value = `${prefix}${startNum}-${endNum}`;
    }
  });
}

// 🔹 Fungsi hapus isi box (textarea isi nomor)
function hapusIsiBox() {
  const textareas = document.querySelectorAll(".file-box textarea");
  textareas.forEach(area => area.value = "");
}
