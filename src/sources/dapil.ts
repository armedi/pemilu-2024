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

export async function getDPRElectoralAreas(): Promise<
  Array<{ kode: string; nama: string }>
> {
  const url =
    "https://infopemilu.kpu.go.id/Pemilu/Dcs_dpr/GetDapilOptions_dprri";
  const response = await fetch(url);
  const { data } = await response.json();
  return data.map((dapil) => ({
    kode: dapil.kode_dapil,
    nama: dapil.nama_dapil,
  }));
}

export async function getDPRDProvElectoralAreas(): Promise<
  Array<{ kode: string; nama: string }>
> {
  const url = "https://infopemilu.kpu.go.id/Pemilu/Dcs_dprprov/GetDapilOptions_dprprov";
  const response = await fetch(url);
  const { data } = await response.json();
  return data.map((dapil) => ({
    kode: dapil.kode_dapil,
    nama: dapil.nama_dapil,
  }));
}
