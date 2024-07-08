const puppeteer = require("puppeteer");

const URL = "https://vscode.dev";

const selectors = [
    `body div[role="application"] > div.monaco-grid-view`,
    `.split-view-view > .editor-group-container`,
    `.split-view-view > .part.sidebar`,
    `.split-view-view > .part.auxiliarybar`,
    `.split-view-view > .part.panel`,
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);

    let failed = false;
    for(const s of selectors){
        try{
            await page.waitForSelector(s, { timeout: 5000 });
            console.info('✅', s);
        }catch(e){
            console.error('❌', s);
            failed = true;
        }
    }

    await browser.close();

    failed && process.exit(1);
})();