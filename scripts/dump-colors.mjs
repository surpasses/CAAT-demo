import { createReadStream } from "fs";
import { PNG } from "pngjs";
const png = new PNG();
createReadStream("./public/logo.png").pipe(png).on("parsed", function () {
  const counts = new Map();
  for (let i = 0; i < this.data.length; i += 4) {
    if (this.data[i + 3] < 200) continue;
    const key = `${this.data[i]},${this.data[i + 1]},${this.data[i + 2]}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
    .forEach(([k, v]) => console.log(k, "->", v));
});
