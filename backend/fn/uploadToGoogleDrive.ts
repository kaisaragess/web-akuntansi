import { google } from 'googleapis';
import { Readable } from 'stream';

// Fungsi untuk meng-upload file ke Google Drive
async function uploadToGoogleDrive(file: Express.Multer.File) {
  const KEY_FILE_PATH = '../config/boxwood-pillar-474609-h6-cdbb18b7251d.json'; // Ganti dengan path file JSON Anda
  const FOLDER_ID = '1KNNpi0k952-f0kXC0IsYgxakQ_GuKiS4'; // Ganti dengan ID folder dari Langkah 2

  // Otentikasi
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const driveService = google.drive({ version: 'v3', auth });

  // Metadata file
  const fileMetadata = {
    name: file.originalname,
    parents: [FOLDER_ID],
  };

  // Media yang akan di-upload
  const media = {
    mimeType: file.mimetype,
    body: Readable.from(file.buffer), // Ubah buffer menjadi stream
  };

  // Kirim request untuk membuat file
  const response = await driveService.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id', // Minta agar API mengembalikan ID file yang baru dibuat
  });

  return response.data.id; // Kembalikan ID file di Google Drive
}

export { uploadToGoogleDrive };