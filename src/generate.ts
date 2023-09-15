import path from "node:path";
import * as R from "ramda";

import { getDPDCandidates } from "./sources/caleg-dpd";
import {
  getDPRCandidates,
  getProvinceDPRDCandidates,
} from "./sources/caleg-dpr-dprd";
import {
  getDPDElectoralAreas,
  getDPRDProvElectoralAreas,
  getDPRElectoralAreas,
} from "./sources/dapil";
import { getPartyId, getPoliticalParties } from "./sources/parpol";

console.log("writing generated/dapil-dpd.json...");

const provinces = await getDPDElectoralAreas();

Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dpd.json"),
  JSON.stringify(provinces, null, 2)
);

console.log("writing generated/caleg-dpd.json...");

const dpdCandidates: any[] = [];

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

Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dpd.json"),
  JSON.stringify(dpdCandidates, null, 2)
);

console.log("writing generated/parpol.json...");

const parties = await getPoliticalParties();

Bun.write(
  path.resolve(import.meta.dir, "../generated/parpol.json"),
  JSON.stringify(parties, null, 2)
);

console.log("writing generated/dapil-dpr.json...");

const dprElectoralAreas = await getDPRElectoralAreas();

Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dpr.json"),
  JSON.stringify(dprElectoralAreas, null, 2)
);

console.log("writing generated/caleg-dpr.json...");

const dprCandidates: any[] = [];

for (let i = 0; i < dprElectoralAreas.length; i++) {
  const dapil = dprElectoralAreas[i];
  console.log(`    fetching DPR candidates from dapil ${dapil.nama}...`);

  await getDPRCandidates(dapil.kode).then((data) => {
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

Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dpr.json"),
  JSON.stringify(dprCandidates, null, 2)
);

console.log("writing generated/dapil-dprd-prov.json...");

const dprdProvElectoralAreas = await getDPRDProvElectoralAreas();

Bun.write(
  path.resolve(import.meta.dir, "../generated/dapil-dprd-prov.json"),
  JSON.stringify(dprdProvElectoralAreas, null, 2)
);

console.log("writing generated/caleg-dprd-prov.json...");

const dprdProvCandidates: any[] = [];

for (let i = 0; i < dprdProvElectoralAreas.length; i++) {
  const dapil = dprdProvElectoralAreas[i];
  console.log(`    fetching DPRD candidates from dapil ${dapil.nama}...`);

  await getProvinceDPRDCandidates(dapil.kode).then((data) => {
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

Bun.write(
  path.resolve(import.meta.dir, "../generated/caleg-dprd-prov.json"),
  JSON.stringify(dprdProvCandidates, null, 2)
);