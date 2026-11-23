// Screenshots of tatarlar.kz sections for video 18 -> video/18-tatarlar-kz/output/site/<name>.png (viewport) + <name>-full.png
import puppeteer from "puppeteer-core";
const out = "video/18-tatarlar-kz/output/site";
const pages = [["home", "/"], ["events", "/events"], ["event", "/events/1"], ["masters", "/masters"], ["master", "/masters/1"], ["news", "/news"], ["article", "/news/tatarparty1026"], ["chats", "/chats"], ["culture", "/culture"], ["words", "/culture/words"], ["nardugan", "/culture/nardugan"], ["media", "/media"], ["games", "/games"], ["dating", "/dating"], ["login", "/auth/login"]];
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" });
const p = await b.newPage();
await p.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
for (const [name, path] of pages) {
  try {
    await p.goto("https://tatarlar.kz" + path, { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1200));
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
    await new Promise((r) => setTimeout(r, 800));
    await p.screenshot({ path: `${out}/${name}.png` });
    await p.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
    console.log(name, p.url(), await p.evaluate(() => document.body.scrollHeight));
  } catch (e) { console.log(name, "ERR", e.message); }
}
await b.close();
