import path from "node:path";
import { assoc, omit, pipe } from "rambda";

import { getDPRCandidates } from "./sources/caleg-dpr";
import { getDPRElectoralAreas } from "./sources/dapil-dpr";
import { getPartyId, getPoliticalParties } from "./sources/parpol";
import { getProvinces } from "./sources/propinsi";

console.log("writing data/parpol.json...");

const parties = await getPoliticalParties();

Bun.write(
  path.resolve(import.meta.dir, "../data/parpol.json"),
  JSON.stringify(parties, null, 2)
);

console.log("writing data/propinsi.json...");

const provinces = await getProvinces();

Bun.write(
  path.resolve(import.meta.dir, "../data/propinsi.json"),
  JSON.stringify(provinces, null, 2)
);

console.log("writing data/dapil-dpr.json...");

const dprElectoralAreas = await getDPRElectoralAreas();

Bun.write(
  path.resolve(import.meta.dir, "../data/dapil-dpr.json"),
  JSON.stringify(dprElectoralAreas, null, 2)
);

console.log("writing data/caleg_dpr.json...");

const dprCandidates: any[] = [];

for (let i = 0; i < dprElectoralAreas.length; i++) {
  const dapil = dprElectoralAreas[i];
  console.log(`    fetching DPR candidates for dapil ${dapil.nama}...`);

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
