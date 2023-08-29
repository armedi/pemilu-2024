export async function getProvinces(): Promise<
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
