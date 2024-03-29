import { expect, test } from "bun:test";
import { transform } from "./caleg-dpd";

test("transform", async () => {
  const result = await transform([
    [
      '<center><i>Nama Provinsi</i><br><b><font size="3">ACEH</font></b></center>',
      '<center><i>Nomor urut</i><br><b><font size="3">1</font></b></center>',
      '<center><img src="../berkas-dpd-dct/11/11_1_ABDUL HADI BANG JONI.png" width="75" ></center>',
      "ABDUL HADI BANG JONI",
      "<center>LAKI - LAKI</center>",
      "KOTA LHOKSEUMAWE / ACEH",
      '<form action="Dct_dpd/profil" method="post" enctype="multipart/form-data">\r\n\r\n\t\t\t\t\t\t\t\t<input type="hidden" name="ID_CANDIDATE" id="ID_CANDIDATE" value="3231e8c75c91b91f2ba01b0db39e9aec0361342765a255bbfc9511e962e61b4ad9481254ca3b2f66886b7835b5ad97a14757c4296fca5895f18f27c5ff904ad3/W+feFIUvqu7hY9XYGOwqAfjILlpdwtntH3cYjrLVns=">\r\n\r\n\t\t\t\t\t\t\t\t<input type="hidden" name="pilihan_publikasi" id="pilihan_publikasi" value="BERSEDIA">\r\n\r\n\t\t\t\t\t\t\t\t<input type="submit" style="font-size:10px;" class="btn btn-secondary" value="PROFIL" style="width: 10px; height: 10px;"> </form>',
    ],
  ]);

  expect(result).toEqual([
    {
      nomor_urut: 1,
      foto: "https://infopemilu.kpu.go.id/berkas-dpd-dct/11/11_1_ABDUL%20HADI%20BANG%20JONI.png",
      nama: "ABDUL HADI BANG JONI",
      jenis_kelamin: "L",
      alamat_kabko: "KOTA LHOKSEUMAWE / ACEH",
      id_calon_dpd: "3231e8c75c91b91f2ba01b0db39e9aec0361342765a255bbfc9511e962e61b4ad9481254ca3b2f66886b7835b5ad97a14757c4296fca5895f18f27c5ff904ad3/W+feFIUvqu7hY9XYGOwqAfjILlpdwtntH3cYjrLVns=",
    },
  ]);
});
