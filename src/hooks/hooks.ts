import { After, AfterAll, Before, BeforeAll, Status } from '@cucumber/cucumber';
import { Browser, BrowserContext, chromium, devices, Page } from '@playwright/test';
import { pageFixture } from './pageFixture';

let browser: Browser;
let context: BrowserContext;
let page: Page;

BeforeAll(async function () {
  const browserOptions = {
    headless: false, // Use headless mode
    ...devices['Desktop Chrome'], // Emulate a desktop device
  };
  browser = await chromium.launch(browserOptions);
});

Before(async function () {
  context = await browser.newContext();
  page = await context.newPage();
  pageFixture.page = page;
});

After(async function ({ pickle, result }) {
  console.log(`Scenario status: ${pickle.name} ==> ${result?.status}`);
  let img: Buffer;
  // Capture screenshot only for failed scenarios
  if (result?.status === Status.FAILED) {
    img = await pageFixture.page.screenshot({
      path: `./test-result/screenshots/${pickle.name}.png`,
      type: 'png',
    });
    this.attach(img, 'image/png');
    console.log(`Failure screenshot captured:`);
  }

  await page.close();
  await context.close();
});

AfterAll(async function () {
  await browser.close();
});
