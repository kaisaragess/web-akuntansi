import { AppDataSource } from "../../data-source";
import { verifyToken } from "../../fn/verifyToken";
import { ExpressAA } from "../expressjs-aa/ExpressAA";
import { POST_journals_Req } from "../expressjs-aa/api/POST_journals";
import { Journal_Entries } from "../model/table/Journal_Entries";
import { Journals } from "../model/table/Journals";
import { JournalRes } from "../ts-schema/JournalRes";

export function implement_POST_journals(engine: ExpressAA) {
  engine.implement({
    endpoint: "POST /journals",
    async fn(param: POST_journals_Req): Promise<JournalRes> {
      const { authorization } = param.headers;
      const token = await verifyToken(authorization);
      if (!token) {
        throw new Error("Unauthorized: Invalid token or missing user ID ");
      }

      const id_user = token;

      try {
        const { nomor_bukti, date, description, lampiran, referensi, entries } =
          param.body;

        if (!nomor_bukti || !date || !entries) {
          throw new Error(
            "Bad Request: nomor_bukti, date, and entries are required"
          );
        }
        if (!Array.isArray(entries) || entries.length === 0) {
          throw new Error(
            "Bad Request: entries must be a non-empty array"
          );
        }

        const journalDate = new Date(date);
        if (isNaN(journalDate.getTime())) {
          throw new Error("Bad Request: Invalid date format");
        }

        // Validasi logika akuntansi
        let totalDebit = 0;
        let totalCredit = 0;
        for (const entry of entries) {
          if (
            typeof entry.debit !== "number" ||
            typeof entry.credit !== "number"
          ) {
            throw new Error(
              "Bad Request: debit and credit in entries must be numbers"
            );
          }
          totalDebit += entry.debit;
          totalCredit += entry.credit;
        }

        if (totalDebit !== totalCredit) {
          throw new Error("Bad Request: Total debit must equal total credit");
        }
        if (totalDebit === 0) {
          throw new Error(
            "Bad Request: Journal entries cannot have zero total value"
          );
        }

        // 🟢 Simpan ke database menggunakan transaksi
        const newJournal = await AppDataSource.manager.transaction(
          async (transactionalEntityManager) => {
            // 1️⃣ Simpan jurnal utama
            const journal = new Journals();
            journal.id_user = id_user;
            journal.date = journalDate;
            journal.description = description;
            journal.referensi = referensi;
            journal.lampiran = lampiran;
            journal.nomor_bukti = nomor_bukti;

            const savedJournal = await transactionalEntityManager.save(journal);

            // Pastikan id_journal benar-benar ada
            if (!savedJournal.id) {
              throw new Error(
                "Failed to generate journal ID. Please check table Journals primary key."
              );
            }

            // 2️⃣ Simpan semua entries yang terhubung ke jurnal ini
            const journalEntriesArray = entries.map((entry) => {
              const newEntry = new Journal_Entries();
              newEntry.id_journal = savedJournal.id; // <- sudah pasti ada ID
              newEntry.code_account = entry.code_account;
              newEntry.debit = entry.debit;
              newEntry.credit = entry.credit;
              return newEntry;
            });

            await transactionalEntityManager.save(journalEntriesArray);

            // Return jurnal yang sudah tersimpan
            return { ...savedJournal, entries: journalEntriesArray };
          }
        );

        // 🧾 Format response
        return {
          id: newJournal.id,
          id_user: newJournal.id_user,
          date: newJournal.date.toISOString(),
          description: newJournal.description || "",
          referensi: newJournal.referensi || "",
          lampiran: newJournal.lampiran || "",
          nomor_bukti: newJournal.nomor_bukti || "",
          entries: newJournal.entries.map((e) => ({
            code_account: e.code_account,
            debit: e.debit,
            credit: e.credit,
          })),
        };
      } catch (error) {
        throw new Error(
          "Gagal membuat jurnal baru." +
            (error instanceof Error ? " Detail: " + error.message : "")
        );
      }
    },
  });
}
