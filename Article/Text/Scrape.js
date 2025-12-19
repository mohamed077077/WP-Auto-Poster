const SELECTOR_TIMEOUT = 20000;

const extractTitle = async (page) => {
  await page.waitForSelector("h1", { timeout: SELECTOR_TIMEOUT });
  const title = await page.textContent("h1");
  return title ? title.trim() : undefined;
};

const addTitle = (components, title) => {
  components.h1 = title;
};

const extactDescription = async (page) => {
  await page.waitForLoadState('domcontentloaded');


  const description = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="description"]');
    return meta ? meta.getAttribute('content') : undefined;
  });

  return description?.trim();

};

const addDescription = (components, description) => {
  components.des = description;
};

const extractElements = async (page) => {
  const articleBody = await page.waitForSelector(`article div[layout="desktop"]`, {
    timeout: SELECTOR_TIMEOUT,
  });
    const selector =
      'article div[layout="desktop"] p, article div[layout="desktop"] h2, article div[layout="desktop"] h3, article div[layout="desktop"] h4, article div[layout="desktop"] h5, article div[layout="desktop"] h6';
    const elements = await page.$$(selector);

  if (!elements || elements.length === 0) {
    throw new Error("there are no elements");
  }

  return elements;
};

const addElements = async (elements, components) => {
  for (let i = 0; i < elements.length; i++) {
      const tagName = await elements[i].evaluate((node) =>
        node.tagName.toLowerCase()
      );
      const text = (await elements[i].textContent()).trim();
      if (!text) continue; // ignore empty paragraph
      components[`${tagName}_${i + 1}`] = text;
    }
};


async function scrapeArticle(page, url) {
  const components = {};

  // Go to article URL
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
  } catch (err) {
    console.error("Article URL is not reachable:", err.message);
    return ;
  }

  // Extract title
  let title;
  try {
    title = await extractTitle(page);
  } catch (err) {
    console.error("Title extraction failed:", err);
    return ;
  }


  addTitle(components, title);


    let description;
  try {
    description = await extactDescription(page);
  } catch (err) {
    console.error("Description extraction failed:", err);
    return ;
  }
  addDescription(components, description);
  
  let elements;
  try {
    elements = await extractElements(page);
  } catch (err) {
    console.error(err.message || err);
    return ;
  }

 await addElements(elements, components);

  return components;
}

export default scrapeArticle;
