import multer from 'multer';

// Konfigurasi Multer untuk menyimpan file di memori sebagai buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB (opsional)
});