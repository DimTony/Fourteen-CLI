import Table from "cli-table3";

export function renderTable(data: any[]) {
  if (!data.length) {
    console.log("No results");
    return;
  }

  const table = new Table({
    head: Object.keys(data[0]),
  });

  data.forEach((row) => {
    table.push(Object.values(row) as any[]);
  });

  console.log(table.toString());
}

export function renderProfilesTable(data: any) {
  const profiles = data.data;

  const table = new Table({
    head: ["ID", "Name", "Gender", "Age", "Age Group", "Country"],
    colWidths: [38, 20, 10, 6, 12, 15],
  });

  profiles.forEach((p: any) => {
    table.push([p.id, p.name, p.gender, p.age, p.age_group, p.country_name]);
  });

  console.log(table.toString());
}