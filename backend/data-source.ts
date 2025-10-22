import * as dotenv from "dotenv";
dotenv.config();
import { DataSource, DataSourceOptions } from "typeorm";

const config: DataSourceOptions = {
  type: "postgres",
  host: process.env.HOST,
  port: Number(process.env.PORT),
  username: process.env.PAGONILA_USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
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