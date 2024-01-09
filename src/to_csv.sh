#!/bin/bash

jq -r '.[] | [.id_calon_dpd, .kode_propinsi, .nomor_urut, .foto, .nama, .jenis_kelamin, .alamat_kabko] | @csv' generated/caleg-dpd.json > generated/caleg-dpd.csv

jq -r '.[] | [.id_calon_dpr, .kode_dapil, .id_partai, .nomor_urut, .foto, .nama, .jenis_kelamin, .alamat_kabko] | @csv' generated/caleg-dpr.json > generated/caleg-dpr.csv

jq -r '.[] | [.id_calon_dpr, .kode_dapil, .id_partai, .nomor_urut, .foto, .nama, .jenis_kelamin, .alamat_kabko] | @csv' generated/caleg-dprd-prov.json > generated/caleg-dprd-prov.csv

caleg_dprd_kabko_file_list=$(ls -1v generated/caleg-dprd-kabko/*.json)

while IFS= read -r file; do
  cat "$file" | jq -r '.[] | [.id_calon_dpr, .kode_dapil, .id_partai, .nomor_urut, .foto, .nama, .jenis_kelamin, .alamat_kabko] | @csv' >> generated/caleg-dprd-kabko.csv
done <<< "$caleg_dprd_kabko_file_list"
