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

const candidateIdRewriter = new HTMLRewriter();
candidateIdRewriter.on("*", {
  element(element) {
    if (element.tagName === "form") {
      element.removeAndKeepContent();
    } else if (
      element.tagName === "input" &&
      element.getAttribute("name") === "id_calon_dpr"
    ) {
      element.replace(element.getAttribute("value") || "");
    } else {
      element.remove();
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
  undefined,
  "id_calon_dpr",
];

const rewriters = [
  partaiRewriter,
  undefined,
  nomorUrutRewriter,
  fotoRewriter,
  new HTMLRewriter(),
  new HTMLRewriter(),
  new HTMLRewriter(),
  undefined,
  candidateIdRewriter,
];

export async function transform(data: string[][]): Promise<
  Array<{
    partai: string;
    nomor_urut: number;
    foto: string;
    nama: string;
    jenis_kelamin: string;
    alamat_kabko: string;
    id_calon_dpr: number;
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
            case "id_calon_dpr":
              return Number(parsed);
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

async function getCandidates(baseURL: string, kode_dapil: string) {
  const url = `${baseURL}?kode_dapil=${kode_dapil}`;

  while (true) {
    try {
      const response = await fetch(url);
      const { data } = await response.json();
      return transform(data);
    } catch (error) {
      console.log(error);
      console.log("retrying...");
    }
  }
}

export async function getDprRICandidates(kode_dapil: string) {
  return getCandidates(
    "https://infopemilu.kpu.go.id/Pemilu/Dct_dpr/Dct_dpr",
    kode_dapil
  );
}

export async function getDprdProvCandidates(kode_dapil: string) {
  return getCandidates(
    "https://infopemilu.kpu.go.id/Pemilu/Dct_dprprov/Dct_dprprov",
    kode_dapil
  );
}

export async function getDprdKabkoCandidates(kode_dapil: string) {
  return getCandidates(
    "https://infopemilu.kpu.go.id/Pemilu/Dct_dprd/Dct_dprdkabko",
    kode_dapil
  );
}
