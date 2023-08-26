const file = Bun.file("./data.sql");
const writer = file.writer({ highWaterMark: 1024 * 1024 }); // 1MB

async function getDapilData() {
  const dapilUrl =
    "https://infopemilu.kpu.go.id/Pemilu/Dcs_dpr/GetDapilOptions_dprri";

  const response = await fetch(dapilUrl);
  const { data } = await response.json();

  return data;
}

const dapil = getDapilData();

await dapil.then((data) => {
  writer.write(`CREATE TABLE dapil (
  kode VARCHAR(10),
  nama VARCHAR(255)
);

INSERT INTO dapil (kode, nama) VALUES\n`);

  data.forEach((item, index) => {
    const eol = index === data.length - 1 ? ";\n\n" : ",\n";
    writer.write(`("${item.kode_dapil}", "${item.nama_dapil}")${eol}`);
  });
});

writer.end();
