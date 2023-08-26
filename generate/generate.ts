import path from "node:path";

import { transform as transformParties, getPartyId } from "./transform/parpol";
import { transform as transformDPRCandidates } from "./transform/caleg-dpr";

const file = Bun.file(path.resolve(import.meta.dir, "../data.sql"));
const writer = file.writer({ highWaterMark: 1024 * 1024 }); // 1MB

async function getPoliticalParties() {
  const url =
    "https://infopemilu.kpu.go.id/Pemilu/Pemutakhiran_parpol/get_parpol_diterima_nasional";
  const response = await fetch(url);
  const { data } = await response.json();
  return transformParties(data);
}

async function getDPRElectoralAreas() {
  const url =
    "https://infopemilu.kpu.go.id/Pemilu/Dcs_dpr/GetDapilOptions_dprri";
  const response = await fetch(url);
  const { data } = await response.json();
  return data;
}

async function getDPRCandidates(kode_dapil: string) {
  const url = `https://infopemilu.kpu.go.id/Pemilu/Dcs_dpr/Dcs_dpr?kode_dapil=${kode_dapil}`;
  const response = await fetch(url);
  const { data } = await response.json();
  return transformDPRCandidates(data);
}

console.log("creating tables...");

writer.write(`CREATE TABLE partai (
  id INTEGER,
  nama VARCHAR(255),
  nomor_urut INTEGER,
  foto VARCHAR(255)
);\n\n`);

writer.write(`CREATE TABLE dapil_dpr (
  kode VARCHAR(10),
  nama VARCHAR(255)
);\n\n`);

writer.write(`CREATE TABLE caleg_dpr (
  id_partai INTEGER,
  kode_dapil VARCHAR(10),
  nomor_urut INTEGER,
  foto VARCHAR(255),
  nama VARCHAR(255),
  jenis_kelamin VARCHAR(255),
  alamat_kabko VARCHAR(255)
);\n\n`);

console.log("writing partai politik...");

const parties = await getPoliticalParties();

writer.write(`INSERT INTO partai (id, nama, nomor_urut, foto) VALUES\n`);

parties.forEach((item, index) => {
  const eol = index === parties.length - 1 ? ";\n\n" : ",\n";
  writer.write(
    `(${item.id}, "${item.nama}", ${item.nomor_urut}, "${item.foto}")${eol}`
  );
});

console.log("writing dapil_dpr...");

const dprElectoralAreas = await getDPRElectoralAreas();

writer.write(`INSERT INTO dapil_dpr (kode, nama) VALUES\n`);

dprElectoralAreas.forEach((item, index) => {
  const eol = index === dprElectoralAreas.length - 1 ? ";\n\n" : ",\n";
  writer.write(`("${item.kode_dapil}", "${item.nama_dapil}")${eol}`);
});

writer.write(
  `INSERT INTO caleg_dpr (id_partai, kode_dapil, nomor_urut, foto, nama, jenis_kelamin, alamat_kabko) VALUES\n`
);

for (let i = 0; i < dprElectoralAreas.length; i++) {
  const dapil = dprElectoralAreas[i];
  console.log(`writing candidates for dapil_dpr ${dapil.nama_dapil}...`);

  await getDPRCandidates(dapil.kode_dapil).then((data) => {
    data.forEach((item, index) => {
      const eol =
        i === dprElectoralAreas.length - 1 && index === data.length - 1
          ? ";\n\n"
          : ",\n";

      writer.write(
        `(${getPartyId(parties, item.partai)}, "${dapil.kode_dapil}", ${
          item.nomor_urut
        }, "${item.foto}", "${item.nama}", "${item.jenis_kelamin}", "${
          item.alamat_kabko
        }")${eol}`
      );
    });
  });

  writer.flush();
}

writer.end();
