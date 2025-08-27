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

// 🔹 Fungsi baru: hapus isi box (textarea)
function hapusIsiBox() {
  const textareas = document.querySelectorAll(".file-box textarea");
  textareas.forEach(area => area.value = "");
}
