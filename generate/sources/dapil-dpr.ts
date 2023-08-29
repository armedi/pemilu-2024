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
