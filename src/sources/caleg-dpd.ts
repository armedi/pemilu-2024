const baseURL = "https://infopemilu.kpu.go.id/Pemilu/Dct_dpd";

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

const candidateIdRewriter = new HTMLRewriter();
candidateIdRewriter.on("*", {
  element(element) {
    if (element.tagName === "form") {
      element.removeAndKeepContent();
    } else if (
      element.tagName === "input" &&
      element.getAttribute("name") === "ID_CANDIDATE"
    ) {
      element.replace(element.getAttribute("value") || "");
    } else {
      element.remove();
    }
  },
});

const fields = [
  undefined,
  undefined,
  "foto",
  "nama",
  "jenis_kelamin",
  "alamat_kabko",
  "id_calon_dpd",
];

const rewriters = [
  undefined,
  undefined,
  fotoRewriter,
  new HTMLRewriter(),
  genderRewriter,
  new HTMLRewriter(),
  candidateIdRewriter,
];

export async function transform(data: string[][]): Promise<
  Array<{
    nomor_urut: number;
    foto: string;
    nama: string;
    jenis_kelamin: string;
    alamat_kabko: string;
    id_calon_dpd: number;
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
              return parsed.includes("PEREMPUAN") ? "P" : "L";
            case "id_calon_dpd":
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

export async function getDPDCandidates(kode_propinsi: string) {
  const url = `${baseURL}/Dct_dpd?kode_pro=${kode_propinsi}`;

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
