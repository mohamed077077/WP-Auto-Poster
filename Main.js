import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import processArticle from "./Article/processArticle.js";
import { getLastArticles, writeLastArticle } from "./LastArticles/handleLastArticles.js";
import openBrowser from "./Browser.js";
import isOnline from "is-online";
import {
  SECTIONS,
  SELECTOR_TIMEOUT,

} from "./config.js";

async function runAutomation(page) {
      const postedArticles = getLastArticles();

      for (const [label, sectionUrl] of Object.entries(SECTIONS)) {
        try {
          await page.goto(sectionUrl, { waitUntil: "domcontentloaded" });
        } catch (err) {
          console.error(`Section URL not reachable (${label}):`, err.message);
          continue;
        }

        let articleUrl;
        try {
          await page.waitForSelector(`div[id="article-list-1"] a`, {
            timeout: SELECTOR_TIMEOUT,
          });
          articleUrl = await page.getAttribute(`div[id="article-list-1"] a`, "href");
        } catch (err) {
          console.error(`Article link missing (${label}):`, err.message);
          continue;
        }

        if (postedArticles.includes(articleUrl)) {
          console.log(`Already posted: ${articleUrl}`);
          continue;
        }
        await processArticle(page, articleUrl, label);

        writeLastArticle(label, articleUrl);

        await new Promise(r => setTimeout(r, 50000)); // 50 second delay

      }
return `Automation run completed.`;
    }
async function main() {
  const page = await openBrowser();
  if (!page)  process.exit(1);
  

  if (await isOnline()) {
    await runAutomation(page);
        process.exit(0);
}
    else {
      console.log("Internet connection error, retrying...");
      process.exit(1);
    }
  }
main();

