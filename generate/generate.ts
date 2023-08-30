import path from "node:path";
import { assoc, omit, pipe } from "rambda";

import { getDPRCandidates } from "./sources/caleg-dpr";
import { getDPRElectoralAreas } from "./sources/dapil-dpr";
import { getPartyId, getPoliticalParties } from "./sources/parpol";
import { getProvinces } from "./sources/propinsi";
import { getDPDCandidates } from "./sources/caleg-dpd";

console.log("writing data/propinsi.json...");

const provinces = await getProvinces();

Bun.write(
  path.resolve(import.meta.dir, "../data/propinsi.json"),
  JSON.stringify(provinces, null, 2)
);

console.log("writing data/caleg-dpd.json...");

const dpdCandidates: any[] = [];

for (let i = 0; i < provinces.length; i++) {
  const province = provinces[i];
  console.log(`    fetching DPD candidates from province ${province.nama}...`);

  await getDPDCandidates(province.kode).then((data) => {
    dpdCandidates.push(
      ...data.map((candidate) => {
        return pipe(assoc("kode_propinsi", province.kode))(candidate);
      })
    );
  });
}

Bun.write(
  path.resolve(import.meta.dir, "../data/caleg-dpd.json"),
  JSON.stringify(dpdCandidates, null, 2)
);

console.log("writing data/parpol.json...");

const parties = await getPoliticalParties();

Bun.write(
  path.resolve(import.meta.dir, "../data/parpol.json"),
  JSON.stringify(parties, null, 2)
);

console.log("writing data/dapil-dpr.json...");

const dprElectoralAreas = await getDPRElectoralAreas();

Bun.write(
  path.resolve(import.meta.dir, "../data/dapil-dpr.json"),
  JSON.stringify(dprElectoralAreas, null, 2)
);

console.log("writing data/caleg-dpr.json...");

const dprCandidates: any[] = [];

for (let i = 0; i < dprElectoralAreas.length; i++) {
  const dapil = dprElectoralAreas[i];
  console.log(`    fetching DPR candidates from dapil ${dapil.nama}...`);

  await getDPRCandidates(dapil.kode).then((data) => {
    dprCandidates.push(
      ...data.map((candidate) => {
        return pipe(
          omit(["partai", "dapil"]),
          assoc("id_partai", getPartyId(parties, candidate.partai)),
          assoc("kode_dapil", dapil.kode),
        )(candidate);
      })
    );
  });
}

Bun.write(
  path.resolve(import.meta.dir, "../data/caleg-dpr.json"),
  JSON.stringify(dprCandidates, null, 2)
);
