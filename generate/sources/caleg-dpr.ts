const partaiRewriter = new HTMLRewriter();
partaiRewriter
  .onDocument({
    text(text) {
      text.replace(text.text.trim());
    },
  })
  .on("*", {
    element(element) {
      element.remove();
    },
  });

const nomorUrutRewriter = new HTMLRewriter();
nomorUrutRewriter.on("*", {
  element(element) {
    if (["center", "b", "font"].includes(element.tagName)) {
      element.removeAndKeepContent();
    } else {
      element.remove();
    }
  },
});

const fotoRewriter = new HTMLRewriter();
fotoRewriter.on("*", {
  element(element) {
    if (element.tagName === "center") {
      element.removeAndKeepContent();
    } else if (element.tagName === "img") {
      element.replace(element.getAttribute("src") || "");
    }
  },
});

const fields = [
  "partai",
  undefined,
  "nomor_urut",
  "foto",
  "nama",
  "jenis_kelamin",
  "alamat_kabko",
];

const rewriters = [
  partaiRewriter,
  undefined,
  nomorUrutRewriter,
  fotoRewriter,
  new HTMLRewriter(),
  new HTMLRewriter(),
  new HTMLRewriter(),
];

async function transform(data: string[][]): Promise<
  Array<{
    partai: string;
    dapil: string;
    nomor_urut: number;
    foto: string;
    nama: string;
    jenis_kelamin: string;
    alamat_kabko: string;
  }>
> {
  let result: any[] = [];

  for (let i = 0; i < data.length; i++) {
    result[i] = {};
    const calon = data[i];

    for (let j = 0; j < calon.length; j++) {
      const row = calon[j];
      const key = fields[j];
      const value = await rewriters[j]
        ?.transform(new Response(row))
        .text()
        .then((parsed) => {
          switch (key) {
            case "nomor_urut":
              return parseInt(parsed);
            case "jenis_kelamin":
              return parsed === "PEREMPUAN" ? "P" : "L";
            default:
              return parsed;
          }
        });

      if (key && value) {
        result[i][key] = value;
      }
    }
  }

  return result;
}

// console.log(
//   await transform([
//     [
//       ' <img src="../berkas-sipol/parpol/profil/gambar_parpol/1656538128_Logo PKB.png" width="30" > Partai Kebangkitan Bangsa',
//       "<center><i>Dapil</i><br>ACEH I</center>",
//       '<center><i>nomor urut</i><br><b><font size="3">1</font></b></center>',
//       '<center><img src="https://infopemilu.kpu.go.id/berkas-calon/dprri/1171042112670001.jpeg" width="75" ></center>',
//       "H. IRMAWAN, S.Sos., M.M.",
//       "LAKI - LAKI",
//       "KOTA BANDA ACEH",
//       '\t\r\n\t\t\t<form action="https://helpdesk.kpu.go.id/tanggapan/" method="post"  enctype="multipart/form-data">\r\n\t\t\t\t<input type="hidden" value="pencalonan_dpr" name="kode_unik" id="kode_unik">\r\n\t\t\t\t<input type="hidden" name="id_calon_dpr" id="id_calon_dpr" value="253581">\r\n\t\t\t\t<input type="hidden" name="parpol_dpr" id="parpol_dpr" value="Partai Kebangkitan Bangsa">\r\n\t\t\t\t<input type="hidden" name="jenis_pemilihan" id="jenis_pemilihan" value="DPRRI">\r\n\t\t\t\t<input type="hidden" name="jenis_kelamin_dpr" id="jenis_kelamin_dpr" value="L">\r\n\t\t\t\t<input type="hidden" name="dapil" id="dapil" value="ACEH I">\r\n\t\t\t\t<input type="hidden" name="nomor_urut" id="nomor_urut" value="1">\r\n\t\t\t\t<input type="hidden" name="alamat_kabko" id="alamat_kabko" value="KOTA BANDA ACEH">\r\n\t\t\t\t<input type="hidden" name="ic_calon_dpr" id="ic_calon_dpr" value="253581">\r\n\t\t\t\t<input type="hidden" name="nama_dpr" id="nama_dpr" value="H. IRMAWAN, S.Sos., M.M.">\r\n\t\t\t\t<input type="hidden" name="id_wilayah_dpr" id="id_wilayah_dpr" value="0">\r\n\t\t\t\t<input type="submit" style="font-size:10px;" class="btn btn-danger" value="TANGGAPAN"  style="width: 10px; height: 10px;" > </form>\r\n\t\t\t',
//     ],
//   ])
// );

export async function getDPRCandidates(kode_dapil: string) {
  const url = `https://infopemilu.kpu.go.id/Pemilu/Dcs_dpr/Dcs_dpr?kode_dapil=${kode_dapil}`;
  const response = await fetch(url);
  const { data } = await response.json();
  return transform(data);
}
