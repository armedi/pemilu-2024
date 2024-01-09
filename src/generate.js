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

const provinces = await getDPDElectoralAreas();

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

const dprRIElectoralAreas = await getDprRIElectoralAreas();

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

const dprdProvElectoralAreas = await getDprdProvElectoralAreas();

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

const dprdKabkoElectoralAreas = await getDprdKabkoElectoralAreas();

console.log("writing generated/caleg-dprd-kabko/*.json...");

for (let i = 0; i < dprdKabkoElectoralAreas.length; i++) {
  const dapil = dprdKabkoElectoralAreas[i];
  console.log(`    fetching DPRD Kabko candidates from dapil ${dapil.nama}...`);

  const dprdKabkoCandidate = await getDprdKabkoCandidates(dapil.kode).then(
    (data) => {
      return data.map((candidate) =>
        R.pipe(
          R.omit(["partai"]),
          R.assoc("id_partai", getPartyId(parties, candidate.partai)),
          R.assoc("kode_dapil", dapil.kode)
        )(candidate)
      );
    }
  );

  await Bun.write(
    path.resolve(
      import.meta.dir,
      "../generated/caleg-dprd-kabko",
      `${dapil.kode}.json`
    ),
    JSON.stringify(dprdKabkoCandidate, null, 2)
  );
}
