import path from "node:path";
import * as R from "ramda";

import { getDPDCandidates } from "./sources/caleg-dpd";
import {
  getDprRICandidates,
  getDprdKabkoCandidates,
  getDprdProvCandidates,
} from "./sources/caleg-dpr-dprd";
import {
  getDPDElectoralAreas,
  getDprRIElectoralAreas,
  getDprdProvElectoralAreas,
  getDprdKabkoElectoralAreas,
} from "./sources/dapil";
import { getPartyId, getPoliticalParties } from "./sources/parpol";

console.log("writing generated/dapil-dpd.json...");

const provinces = await getDPDElectoralAreas();

await Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dpd.json"),
  JSON.stringify(provinces, null, 2)
);

console.log("writing generated/caleg-dpd.json...");

const dpdCandidates = [];

for (let i = 0; i < provinces.length; i++) {
  const province = provinces[i];
  console.log(`    fetching DPD candidates from province ${province.nama}...`);

  await getDPDCandidates(province.kode).then((data) => {
    dpdCandidates.push(
      ...data.map((candidate) => {
        return R.pipe(R.assoc("kode_propinsi", province.kode))(candidate);
      })
    );
  });
}

await Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dpd.json"),
  JSON.stringify(dpdCandidates, null, 2)
);

console.log("writing generated/parpol.json...");

const parties = await getPoliticalParties();

await Bun.write(
  path.resolve(import.meta.dir, "../generated/parpol.json"),
  JSON.stringify(parties, null, 2)
);

console.log("writing generated/dapil-dpr.json...");

const dprRIElectoralAreas = await getDprRIElectoralAreas();

await Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dpr.json"),
  JSON.stringify(dprRIElectoralAreas, null, 2)
);

console.log("writing generated/caleg-dpr.json...");

const dprCandidates = [];

for (let i = 0; i < dprRIElectoralAreas.length; i++) {
  const dapil = dprRIElectoralAreas[i];
  console.log(`    fetching DPR candidates from dapil ${dapil.nama}...`);

  await getDprRICandidates(dapil.kode).then((data) => {
    dprCandidates.push(
      ...data.map((candidate) =>
        R.pipe(
          R.omit(["partai", "dapil"]),
          R.assoc("id_partai", getPartyId(parties, candidate.partai)),
          R.assoc("kode_dapil", dapil.kode)
        )(candidate)
      )
    );
  });
}

await Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dpr.json"),
  JSON.stringify(dprCandidates, null, 2)
);

console.log("writing generated/dapil-dprd-prov.json...");

const dprdProvElectoralAreas = await getDprdProvElectoralAreas();

await Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dprd-prov.json"),
  JSON.stringify(dprdProvElectoralAreas, null, 2)
);

console.log("writing generated/caleg-dprd-prov.json...");

const dprdProvCandidates = [];

for (let i = 0; i < dprdProvElectoralAreas.length; i++) {
  const dapil = dprdProvElectoralAreas[i];
  console.log(`    fetching DPRD Prov candidates from dapil ${dapil.nama}...`);

  await getDprdProvCandidates(dapil.kode).then((data) => {
    dprdProvCandidates.push(
      ...data.map((candidate) =>
        R.pipe(
          R.omit(["partai"]),
          R.assoc("id_partai", getPartyId(parties, candidate.partai)),
          R.assoc("kode_dapil", dapil.kode)
        )(candidate)
      )
    );
  });
}

await Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dprd-prov.json"),
  JSON.stringify(dprdProvCandidates, null, 2)
);

console.log("writing generated/dapil-dprd-kabko.json...");

const dprdKabkoElectoralAreas = await getDprdKabkoElectoralAreas();

await Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dprd-kabko.json"),
  JSON.stringify(dprdKabkoElectoralAreas, null, 2)
);

console.log("writing generated/caleg-dprd-kabko.json...");

const dprdKabkoCandidates = [];

for (let i = 0; i < dprdKabkoElectoralAreas.length; i++) {
  const dapil = dprdKabkoElectoralAreas[i];
  console.log(`    fetching DPRD Kabko candidates from dapil ${dapil.nama}...`);

  await getDprdKabkoCandidates(dapil.kode).then((data) => {
    dprdKabkoCandidates.push(
      ...data.map((candidate) =>
        R.pipe(
          R.omit(["partai"]),
          R.assoc("id_partai", getPartyId(parties, candidate.partai)),
          R.assoc("kode_dapil", dapil.kode)
        )(candidate)
      )
    );
  });
}

await Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dprd-kabko.json"),
  JSON.stringify(dprdKabkoCandidates, null, 2)
);
