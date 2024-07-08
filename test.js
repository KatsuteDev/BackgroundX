const assert = require("assert");
const puppeteer = require("puppeteer");

(async () => {
    const URL = "https://vscode.dev";

    // init puppeteer

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);

    const selectorExists = async (selector) => {
        try{
            await page.waitForSelector(selector, { timeout: 5000 });
            return true;
        }catch(e){
            return false;
        }
    }

    // selectors

    const selectors = [
        `body div[role="application"] > div.monaco-grid-view`,
        `.split-view-view > .editor-group-container`,
        `.split-view-view > .part.sidebar`,
        `.split-view-view > .part.auxiliarybar`,
        `.split-view-view > .part.panel`,
    ];

    // test

    let failed = false;
    for(const s of selectors){
        try{
            assert(await selectorExists(s));
            console.info('✅', s);
        }catch(e){
            console.error('❌', s);
            failed = true;
        }
    };

    // post

    await browser.close();

    failed && process.exit(1);
})();