export async function getDPDElectoralAreas(): Promise<
  Array<{ kode: string; nama: string }>
> {
  const url = "https://infopemilu.kpu.go.id/Pemilu/Dcs_dpd/GetDapilOptions";
  const response = await fetch(url);
  const { data } = await response.json();
  return data.map((dapil) => ({
    kode: dapil.kode_pro,
    nama: dapil.nama_wilayah,
  }));
}

async function getDprElectoralAreas(url: string): Promise<
  Array<{ kode: string; nama: string }>
> {
  const response = await fetch(url);
  const { data } = await response.json();
  return data.map((dapil) => ({
    kode: dapil.kode_dapil,
    nama: dapil.nama_dapil,
  }));
}

export async function getDprRIElectoralAreas() {
  return getDprElectoralAreas("https://infopemilu.kpu.go.id/Pemilu/Dcs_dpr/GetDapilOptions_dprri");
}

export async function getDprdProvElectoralAreas() {
  return getDprElectoralAreas("https://infopemilu.kpu.go.id/Pemilu/Dcs_dprprov/GetDapilOptions_dprprov");
}

export async function getDprdKabkoElectoralAreas() {
  return getDprElectoralAreas("https://infopemilu.kpu.go.id/Pemilu/Dcs_dprd/GetDapilOptions_dprdkabko");
}
