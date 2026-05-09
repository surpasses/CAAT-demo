import { createReadStream, writeFileSync } from "fs";
import { PNG } from "pngjs";

const PALETTE = [
  { r: 106, g: 100, b: 100, hex: "#6a6464" }, // gray
  { r: 190, g: 31,  b: 49,  hex: "#be1f31" }, // red
];

const dist = (r, g, b, c) => (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
const nearest = (r, g, b) =>
  PALETTE.reduce((best, c) => (dist(r, g, b, c) < dist(r, g, b, best) ? c : best)).hex;

const png = new PNG();
createReadStream("./public/logo.png")
  .pipe(png)
  .on("parsed", function () {
    const { width, height, data } = this;

    const grid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const i = (y * width + x) * 4;
        return data[i + 3] < 128 ? null : nearest(data[i], data[i + 1], data[i + 2]);
      })
    );

    const rects = [];
    for (let y = 0; y < height; y++) {
      let x = 0;
      while (x < width) {
        const color = grid[y][x];
        if (!color) { x++; continue; }
        let run = 1;
        while (x + run < width && grid[y][x + run] === color) run++;
        rects.push(`<rect x="${x}" y="${y}" width="${run}" height="1" fill="${color}"/>`);
        x += run;
      }
    }

    writeFileSync(
      "./public/logo.svg",
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">\n${rects.join("\n")}\n</svg>`
    );
    console.log(`Done: ${rects.length} rects, palette: ${PALETTE.map((c) => c.hex).join(", ")}`);
  });
