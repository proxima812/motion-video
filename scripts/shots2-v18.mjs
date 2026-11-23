// Extra captures for video 18: home (no scroll), wedding.tatarlar.kz, photo URLs of the Tatar Party report
import puppeteer from "puppeteer-core";
const out = "video/18-tatarlar-kz/output/site";
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
for (const [name, url] of [["home", "https://tatarlar.kz/"], ["wedding", "https://wedding.tatarlar.kz/"]]) {
  await p.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));
  await p.screenshot({ path: `${out}/${name}.png` });
  console.log(name, p.url());
}
await p.goto("https://tatarlar.kz/news/tatarparty1026", { waitUntil: "networkidle2", timeout: 45000 });
for (let i = 0; i < 12; i++) { await p.evaluate(() => window.scrollBy(0, 900)); await new Promise((r) => setTimeout(r, 300)); }
const imgs = await p.evaluate(() => [...document.images].map((i) => [i.currentSrc || i.src, i.naturalWidth, i.naturalHeight]));
console.log(JSON.stringify(imgs.filter((i) => i[1] > 300)));
await b.close();
