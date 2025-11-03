import { PUT_journals__id_Req } from '../expressjs-aa/api/PUT_journals__id';
import { AppDataSource } from "../../data-source"; // Import AppDataSource untuk akses database dan transaksi
import { verifyToken } from "../../fn/verifyToken"; // Import fungsi verifyToken untuk validasi JWT
import { ExpressAA } from "../expressjs-aa/ExpressAA"; // Import class ExpressAA untuk implementasi endpoint
import { Journal_Entries } from "../model/table/Journal_Entries"; // Import model Journal_Entries dari database
import { Journals } from "../model/table/Journals"; // Import model Journals dari database
import { Entry } from '../ts-schema/Entry' // Import tipe Entry untuk entries jurnal
import { JournalRes } from '../ts-schema/JournalRes' // Import tipe JournalRes untuk response

export function implement_PUT_journals__id(engine: ExpressAA) {
  // Fungsi untuk implementasi endpoint PUT /journals/:id
  engine.implement({
    endpoint: 'PUT /journals/:id', // Menentukan route endpoint
    async fn(param: PUT_journals__id_Req): Promise<JournalRes> { // Fungsi handler untuk endpoint
      const { authorization } = param.headers; // Ambil header authorization
      const token = await verifyToken(authorization); // Verifikasi token JWT
      if (!token) { // Jika token tidak valid atau tidak ada
        throw new Error("Unauthorized: Missing token"); // Lempar error
      }

      const id = Number(param.paths.id); // Ambil ID jurnal dari path parameter dan konversi ke number
      if (isNaN(id) || id <= 0) { // Validasi format ID
        throw new Error("Bad Request: Invalid Journal ID format"); // Lempar error jika invalid
      }

      const journal = await Journals.findOne({ where: { id } }); // Cari jurnal berdasarkan ID
      if (!journal) { // Jika jurnal tidak ditemukan
        throw new Error("Jurnal tidak ditemukan"); // Lempar error
      }

      const {date, entries, description, lampiran, referensi} = param.body; // Ambil data dari request body

      if (!date || !entries) { // Validasi date dan entries
        throw new Error("Bad Request: nomor_bukti, date, and entries are required"); // Lempar error jika kosong
      }

      journal.date = new Date(date); // Update tanggal jurnal
      journal.description = description || ""; // Update deskripsi atau kosong jika tidak ada
      journal.lampiran = lampiran || ""; // Update lampiran atau kosong jika tidak ada
      journal.referensi = referensi || ""; // Update referensi atau kosong jika tidak ada
      await journal.save(); // Simpan perubahan jurnal

      await Journal_Entries.delete({ id_journal: journal.id }); // Hapus semua entries lama jurnal

      for (const entry of entries as Entry[]) { // Loop setiap entry baru
        const newEntry = new Journal_Entries(); // Buat instance Journal_Entries baru
        newEntry.id_journal = journal.id; // Set ID jurnal
        newEntry.id_coa = entry.id_coa; // Set ID COA
        newEntry.debit = entry.debit; // Set debit
        newEntry.credit = entry.credit; // Set credit
        await newEntry.save(); // Simpan entry baru ke database
      }

      // 🔁 Ambil ulang jurnal beserta entries
      const updatedEntries = await Journal_Entries.find({ where: { id_journal: journal.id } });

      const result: JournalRes = {
        id: journal.id, // ID jurnal
        id_user: journal.id_user, // ID user pemilik jurnal
        nomor_bukti: journal.nomor_bukti, // Nomor bukti jurnal
        date: date, // Tanggal jurnal
        description: journal.description, // Deskripsi jurnal
        lampiran: journal.lampiran, // Lampiran jurnal
        referensi: journal.referensi, // Referensi jurnal
        entries: entries // Entries jurnal yang baru
      };

      return result; // Kembalikan data jurnal yang telah diperbarui
    }
  });
}