import multer from 'multer';
import path from 'path';

// Konfigurasi penyimpanan untuk Multer
const storage = multer.diskStorage({
  // Tentukan folder tujuan untuk menyimpan file
  destination: function (req, file, cb) {
    cb(null, './uploads/attachments/'); // Pastikan folder ini ada
  },
  // Tentukan nama file untuk menghindari nama yang sama
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });