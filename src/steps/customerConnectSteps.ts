import { Given, Then, When } from '@cucumber/cucumber';
import webapp from '../framework/webapp'
import { Navigation as CustomerConnectNavigation } from '../selectors/customerConnect/Navigation'
import { Customer as CustomerConnectCustomer } from '../selectors/customerConnect/Customer'
import { Locator, expect, Browser, BrowserContext, chromium, Page } from '@playwright/test';

let launchChromium: Browser
let pwcontext: BrowserContext
let pw: Page

export const pwconfig = {
  timeout: 120000,
  viewport: { height: 1080, width: 1920 },
}

export { launchChromium, pw, pwcontext }

Given('User navigates to the Customer Connect page', { timeout: 100000 }, async () => {
  await webAppLogin();
})


When('User validates all the navigation link', async function () {
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.dashboardLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.caseManagementLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.customerManagementLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.customerSubLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.solutionSubLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.pricingSubLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.settingsSubLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.contractLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.paymentLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.settingsBottomLink});
  await webapp.checkIfElementExists({selector: CustomerConnectNavigation.reduceMenuLink});
});

Then('User search with {string} customer name', async function (customerName: string) {
  await webapp.click({selector:  CustomerConnectNavigation.customerManagementLink});
  await webapp.click({selector:  CustomerConnectCustomer.changeCustomer});
  await webapp.typeText({selector:  CustomerConnectCustomer.nameField, text: customerName})
  await webapp.click({selector:  CustomerConnectCustomer.searchField});
  await webapp.waitForDocumentLoaded();
  const data: Locator = await webapp.getElement({ selector: CustomerConnectCustomer.noCustomerFound });
  expect(await data.textContent()).toBe('No Records found');
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const launchBrowser = async () => {
  launchChromium = await chromium.launch(pwconfig)
  pwcontext = await launchChromium.newContext(pwconfig)
  // await pwcontext.tracing.start({ screenshots: true, snapshots: true })
  pw = await pwcontext.newPage()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const webAppLogin = async () => {
  await launchBrowser()
  const CUSTOMER_CONNECT_URL = 'https://customer-connect.qa1-core.aws.converadev.com/';
  await webapp.waitUntilPageIsLoaded()
  await pw.goto(CUSTOMER_CONNECT_URL)
  await pw.waitForLoadState();
  await pw.waitForURL(CUSTOMER_CONNECT_URL);
  expect(await pw.title()).toBe('Convera Customer Connect')
}
