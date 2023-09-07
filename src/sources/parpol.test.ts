import { test, expect } from "bun:test";
import { transform } from "./parpol";

test("transform", async () => {
  const result = await transform([
    [
      '<span  style="font-size:22px;">1</span>',
      '<img src="../berkas-sipol/parpol/profil/gambar_parpol/1656538128_Logo PKB.png" width="50" height="20"></>',
      '<br><br><a href="Pemilu/../Detail_pemutakhiran_parpol/detail_parpol/8" targer="_blank" style="color:black" >Partai Kebangkitan Bangsa</a>',
    ],
  ]);

  expect(result).toEqual([
    {
      nomor_urut: 1,
      foto: "https://infopemilu.kpu.go.id/Pemilu/berkas-sipol/parpol/profil/gambar_parpol/1656538128_Logo%20PKB.png",
      id: 8,
      nama: "Partai Kebangkitan Bangsa",
    },
  ]);
});
