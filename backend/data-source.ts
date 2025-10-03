import * as dotenv from "dotenv";
dotenv.config();
import { DataSource, DataSourceOptions } from "typeorm";
 

console.log('--- MEMERIKSA VARIABEL ENV UNTUK DATABASE ---');
console.log('USERNAME:', process.env.PAGONILA_USERNAME);
console.log('PASSWORD:', process.env.PASSWORD ? '****** (ada isinya)' : undefined); // Jangan log password asli
console.log('HOST:', process.env.HOST);
console.log('DATABASE:', process.env.DATABASE);
console.log('-------------------------------------------');

const config: DataSourceOptions = {
  type: "postgres",
  host: process.env.HOST,
  port: Number(process.env.PORT),
  username: process.env.PAGONILA_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE, // <-- nama database
  synchronize: false,
  logging: false,
  migrations: [
    __dirname + '/migration/**.ts' // <-- path "migration" akan dijadikan acuan lokasi untuk men-generate migration database
  ],
  entities: [
    __dirname + '/lib-api/model/**/*.{ts,js}' // <-- "lib-api" = nama sesuai output keluaran generator kode
  ]
};

export const AppDataSource = new DataSource(config);