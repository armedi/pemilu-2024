const baseURL = "https://infopemilu.kpu.go.id/Pemilu/Pemutakhiran_parpol/";

const nomorUrutRewriter = new HTMLRewriter();
nomorUrutRewriter.on("*", {
  element(element) {
    element.removeAndKeepContent();
  },
});

const nomorUrutToJson = (text: string) => {
  return { nomor_urut: parseInt(text) };
};

const fotoRewriter = new HTMLRewriter();
fotoRewriter.on("*", {
  element(element) {
    if (element.tagName === "img") {
      element.replace(element.getAttribute("src") || "");
    } else {
      element.remove();
    }
  },
});

const fotoToJson = (text: string) => {
  return { foto: new URL(text.replace("</>", ""), baseURL).toString() };
};

const namaRewriter = new HTMLRewriter();
namaRewriter.on("*", {
  element(element) {
    if (element.tagName === "a") {
      element.prepend((element.getAttribute("href") || "") + ";");
      element.removeAndKeepContent();
      element.onEndTag((a) => {});
    } else {
      element.remove();
    }
  },
});

const namaToJson = (text: string) => {
  const [detail_url, nama] = text.split(";");
  return {
    id: parseInt(detail_url.split("/").pop()!),
    nama,
  };
};

const rewriters = [nomorUrutRewriter, fotoRewriter, namaRewriter];
const textToJson = [nomorUrutToJson, fotoToJson, namaToJson];

export async function transform(data: string[][]): Promise<
  Array<{
    id: number;
    nama: string;
    nomor_urut: number;
    foto: string;
  }>
> {
  let result: any[] = [];

  for (let i = 0; i < data.length; i++) {
    result[i] = {};
    const parpol = data[i];

    for (let j = 0; j < parpol.length; j++) {
      const row = parpol[j];
      const text = await rewriters[j].transform(new Response(row)).text();
      Object.assign(result[i], textToJson[j](text));
    }
  }

  return result;
}

// console.log(
//   await transform([
//     [
//       '<span  style="font-size:22px;">1</span>',
//       '<img src="../berkas-sipol/parpol/profil/gambar_parpol/1656538128_Logo PKB.png" width="50" height="20"></>',
//       '<br><br><a href="Pemilu/../Detail_pemutakhiran_parpol/detail_parpol/8" targer="_blank" style="color:black" >Partai Kebangkitan Bangsa</a>',
//     ],
//   ])
// );

export async function getPoliticalParties() {
  const url = new URL("get_parpol_diterima_nasional", baseURL);
  console.log(url.toString());
  const response = await fetch(url);
  const { data } = await response.json();
  return transform(data);
}

export function getPartyId(
  parties: Array<{ id: number; nama: string }>,
  name: string
) {
  const partyName =
    {
      "Partai Golongan Karya": "Partai GOLKAR",
      "PARTAI PERINDO": "PERINDO",
    }[name] || name;
  return parties.find(
    (parpol) => parpol.nama.toLowerCase() === partyName.toLowerCase()
  )!.id;
}
