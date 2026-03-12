// Veritabanı Kurulumu (Dexie.js)
const db = new Dexie("AnfaDatabase");
db.version(1).stores({
    kayitlar: "++id, kategori, tarih, aciklama"
});

let mevcutKategori = "Park_Faaliyet";
let seciliResimler = [];
let aktifKayitId = null;

// Menü Kontrol
function toggleMenu() { document.getElementById('sidebar').classList.toggle('active'); }

function kategoriSec(kat) {
    mevcutKategori = kat;
    document.getElementById('baslik').innerText = kat.replace('_', ' ');
    document.getElementById('personelOzel').classList.toggle('hidden', kat !== 'Personel');
    toggleMenu();
    listele();
}

function formAc() { document.getElementById('formModal').classList.remove('hidden'); }
function formKapat() { document.getElementById('formModal').classList.add('hidden'); }

// Resimleri Hafızaya Alma ve Küçültme
async function resimHazirla() {
    const files = Array.from(document.getElementById('resimler').files).slice(0, 4);
    seciliResimler = [];
    document.getElementById('onizleme').innerHTML = "";

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            seciliResimler.push(e.target.result);
            const img = document.createElement('img');
            img.src = e.target.result;
            document.getElementById('onizleme').appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// KAYDETME (Tam Otomatik)
async function kaydet() {
    const tarih = document.getElementById('tarih').value || new Date().toISOString().split('T')[0];
    const aciklama = document.getElementById('aciklama').value;
    const pAd = document.getElementById('pAd').value;

    await db.kayitlar.add({
        kategori: mevcutKategori,
        tarih,
        aciklama,
        pAd,
        resimler: seciliResimler
    });

    formKapat();
    listele();
    // Formu temizle
    document.getElementById('aciklama').value = "";
    document.getElementById('onizleme').innerHTML = "";
}

// LİSTELEME
async function listele() {
    const arama = document.getElementById('aramaKutusu').value.toLowerCase();
    const veriler = await db.kayitlar.where("kategori").equals(mevcutKategori).reverse().toArray();
    
    const liste = document.getElementById('liste');
    liste.innerHTML = "";

    veriler.forEach(d => {
        if (d.aciklama.toLowerCase().includes(arama) || d.tarih.includes(arama)) {
            const div = document.createElement('div');
            div.className = "list-item";
            div.innerHTML = `<strong>${d.tarih}</strong><p>${d.aciklama.substring(0,50)}...</p>`;
            div.onclick = () => detayGoster(d);
            liste.appendChild(div);
        }
    });
}

// DETAY GÖRÜNTÜLEME
function detayGoster(d) {
    aktifKayitId = d.id;
    document.getElementById('detayModal').classList.remove('hidden');
    document.getElementById('detayBaslik').innerText = d.tarih;
    document.getElementById('detayIcerik').innerHTML = `<p>${d.aciklama}</p>`;
    
    const resimDiv = document.getElementById('detayResimler');
    resimDiv.innerHTML = "";
    d.resimler.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        resimDiv.appendChild(img);
    });
}

function detayKapat() { document.getElementById('detayModal').classList.add('hidden'); }

async function kayitSil() {
    if(confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
        await db.kayitlar.delete(aktifKayitId);
        detayKapat();
        listele();
    }
}

// İlk Açılış
window.onload = listele;

