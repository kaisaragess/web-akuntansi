import { DataSource, DataSourceOptions } from "typeorm";
 
const config: DataSourceOptions = {
  type: "postgres",
  host: 'db.pagonila.id',
  port: 47001,
  username: 'lrntz_gambitsch',
  password: '6a2bfa7b8a',
  database: 'web_akuntansi_1c5edb1fc5fe47b59326d96d786175f1', // <-- nama database
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