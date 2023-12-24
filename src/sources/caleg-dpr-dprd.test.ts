import { test, expect } from "bun:test";
import { transform } from "./caleg-dpr-dprd";

test("transform", async () => {
  const result = await transform([
    [
      ' <img src="../berkas-sipol/parpol/profil/gambar_parpol/1656538128_Logo PKB.png" width="30" > Partai Kebangkitan Bangsa',
      "<center><i>Dapil</i><br>ACEH I</center>",
      '<center><i>nomor urut</i><br><b><font size="3">1</font></b></center>',
      '<center><img src="https://infopemilu.kpu.go.id/dct/berkas-silon/calon_unggah/96160/pas_foto/1171042112670001.jpeg" width="75" loading="lazy"></center>',
      "H. IRMAWAN, S.Sos., M.M.",
      "LAKI - LAKI",
      "KOTA BANDA ACEH",
      "",
      '<form action="Dct_dpr/profile" method="post" enctype="multipart/form-data">\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t\t\t\t\t<input type="hidden" name="id_calon_dpr" id="id_calon_dpr" value="253581">\r\n\t\t\t\t\t\t\t\t\t<input type="hidden" name="logo_partai" id="logo_partai" value="berkas-sipol/parpol/profil/gambar_parpol/1656538128_Logo PKB.png">\r\n\t\t\t\t\t\t\t\t\t<input type="hidden" name="id_parpol" id="id_parpol" value="8">\r\n                                                                     \t<input type="hidden" name="code" id="code">\r\n\t\t\t\t\t\t\t\t\t<input type="hidden" name="pilihan_publikasi" id="pilihan_publikasi" value="">\r\n\t\t\t\t\t\t\t\t\t<input type="hidden" name="status_publikasi" id="status_publikasi" value="Bersedia">\r\n\t\t\t\t\t\t\t\t\t<input type="submit" style="font-size:10px;" class="btn btn-secondary" value="PROFIL" style="width: 10px; height: 10px;"> </form>',
    ],
  ]);

  expect(result).toEqual([
    {
      partai: "Partai Kebangkitan Bangsa",
      nomor_urut: 1,
      foto: "https://infopemilu.kpu.go.id/dct/berkas-silon/calon_unggah/96160/pas_foto/1171042112670001.jpeg",
      nama: "H. IRMAWAN, S.Sos., M.M.",
      jenis_kelamin: "L",
      alamat_kabko: "KOTA BANDA ACEH",
      id_calon_dpr: 253581,
    },
  ]);
});
