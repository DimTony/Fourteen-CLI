import Table from "cli-table3";
export function renderTable(data) {
    if (!data.length) {
        console.log("No results");
        return;
    }
    const table = new Table({
        head: Object.keys(data[0]),
    });
    data.forEach((row) => {
        table.push(Object.values(row));
    });
    console.log(table.toString());
}
export function renderProfilesTable(data) {
    const profiles = data.data;
    const table = new Table({
        head: ["ID", "Name", "Gender", "Age", "Age Group", "Country"],
        colWidths: [38, 20, 10, 6, 12, 15],
    });
    profiles.forEach((p) => {
        table.push([p.id, p.name, p.gender, p.age, p.age_group, p.country_name]);
    });
    console.log(table.toString());
}
