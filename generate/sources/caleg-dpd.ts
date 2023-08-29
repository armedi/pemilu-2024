const baseURL = "https://infopemilu.kpu.go.id/Pemilu/Dcs_dpd";

const fotoRewriter = new HTMLRewriter();
fotoRewriter.on("*", {
  element(element) {
    if (element.tagName === "center") {
      element.removeAndKeepContent();
    } else if (element.tagName === "img") {
      element.replace(
        new URL(element.getAttribute("src") || "", baseURL).toString()
      );
    }
  },
});

const genderRewriter = new HTMLRewriter();
fotoRewriter.on("*", {
  element(element) {
    element.removeAndKeepContent();
  },
});

const fields = [
  undefined,
  undefined,
  "foto",
  "nama",
  "jenis_kelamin",
  "alamat_kabko",
];

const rewriters = [
  undefined,
  undefined,
  fotoRewriter,
  new HTMLRewriter(),
  genderRewriter,
  new HTMLRewriter(),
];

async function transform(data: string[][]): Promise<
  Array<{
    nomor_urut: number;
    foto: string;
    nama: string;
    jenis_kelamin: string;
    alamat_kabko: string;
  }>
> {
  let result: any[] = [];

  for (let i = 0; i < data.length; i++) {
    result[i] = {
      nomor_urut: i + 1,
    };

    const candidate = data[i];

    for (let j = 0; j < candidate.length; j++) {
      const row = candidate[j];
      const key = fields[j];
      const value = await rewriters[j]
        ?.transform(new Response(row))
        .text()
        .then((parsed) => {
          switch (key) {
            case "nama":
              return parsed.trim();
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
//       '<center><i>Nama Provinsi</i><br><b><font size="3">ACEH</font></b></center>',
//       '<center><i>Nomor urut</i><br><b><font size="3">1</font></b></center>',
//       '<center><img src="../berkas-dpd/11/11_1_ABDUL HADI BANG JONI.png" width="75" ></center>',
//       " ABDUL HADI BANG JONI",
//       "<center>LAKI - LAKI</center>",
//       "KOTA LHOKSEUMAWE/ACEH",
//       "\r\n\t\t\t\t\t\t",
//     ],
//   ])
// );

export async function getDPDCandidates(kode_propinsi: string) {
  const url = `https://infopemilu.kpu.go.id/Pemilu/Dcs_dpd/Dcs_dpd?kode_pro=${kode_propinsi}`;
  const response = await fetch(url);
  const { data } = await response.json();
  return transform(data);
}
