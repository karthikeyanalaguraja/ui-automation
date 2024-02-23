import fs from 'fs';
import path from 'path';
import { Download, Locator, Page } from 'playwright';
import { expect } from '@playwright/test';

import sleep from './utils/sleep';
import { retryWithTimeout } from './utils/strategy';
import log from './utils/log';

let pw: Page;

const defaultConfig = {
  retryTimeout: 60 * 1000,
  retryPollInterval: 500,
};

/**
 * get the frame reference. If you need frame reference for multiple frames
 * use | as a separator
 * @param selector selector for the frame.
 * @returns frame reference that can be used for element actions
 * @example getFrame({selector:"#layoutFrame|#Frame_1|#Frame2"})
 * getFrame({selector:"#layoutFrame"})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getFrame = async (args: { selector: string }) => {
  let frameSelectors: any[] = [];
  if (args.selector.includes('|')) {
    frameSelectors = args.selector.split('|');
  } else {
    frameSelectors.push(args.selector);
  }
  let pg;
  for (const frame in frameSelectors) {
    log.info(`Finding Frame with element selector ${frameSelectors[frame]}`);
    pg = await (pg ? pg : pw).frameLocator(frameSelectors[frame]);
  }
  return pg;
};

/**
 * Clicking on Element(s)
 * @param selector element selector
 * @param frame element frame selector (this is optional)
 * @param occurance nth element on which the action has to be performed(optional)
 * @param timeout timeout in milliseconds(optional)
 * @param window window reference of the element(optional)
 * @example webapp.click({selector:Home.Button,frame:'#layoutFrame',occurance:1,timeout:30000,window:window})
 *  webapp.click({selector:Home.Button})
 *  webapp.click({selector:Home.Button,frame:'#layoutFrame'})
 */

const click = async (args: {
  selector: string;
  frame?: string;
  occurance?: number;
  timeout?: number;
  window?: Page;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  const pg: Page | any = args.window ? args.window : args.frame ? await getFrame({ selector: args.frame }) : pw;
  log.info(`Clicking on element with selector ${args.selector}`);
  try {
    const noOfElementsFound = await pg.locator(args.selector).count();
    if (noOfElementsFound > 1) {
      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .waitFor({ timeout: args.timeout ? args.timeout : 30000 });

      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .click();
    } else {
      await pg.locator(args.selector).waitFor();
      await pg.locator(args.selector).click();
    }
  } catch (ex) {
    log.error(`Clicking on element ${args.selector} failed with exception ${ex}`);
  }
};
/**
 * double click an element
 * @param selector element selector
 * @param frame frame selector(optional)
 * @param occurance nth element on which the action has to be performed(optional)
 * @example mobileapp.doubleClick({selector:'#btn',frame:'#layoutFrame',occurance:1})
 * mobileapp.doubleClick({selector:'#btn'})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const doubleClick = async (args: { selector: string; frame?: string; occurance?: number }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  log.info(`Clicking on element with selector ${args.selector}`);
  try {
    const noOfElementsFound = await pg.locator(args.selector).count();
    if (noOfElementsFound > 1) {
      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .dblclick();
    } else {
      await pg.locator(args.selector).dblclick();
    }
  } catch (ex) {
    log.error(`Clicking on element ${args.selector} failed with exception ${ex}`);
  }
};
/**
 * Clear the element
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const clear = async (args: { selector: string; frame?: string; occurance?: number; timeout?: number }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  log.info(`clearing on element with selector ${args.selector}`);
  try {
    const noOfElementsFound = await pg.locator(args.selector).count();
    if (noOfElementsFound > 1) {
      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .waitFor({ timeout: args.timeout ? args.timeout : 30000 });
      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .clear();
    } else {
      await pg.locator(args.selector).waitFor();
      await pg.locator(args.selector).clear();
    }
  } catch (ex) {
    log.error(`Clearing on element ${args.selector} failed with exception ${ex}`);
  }
};

/**
 * This method is used to send keys to an element
 * @param selector selector of the element
 * @param text text to be entered in the element
 * @param frame frame selector (optional)
 * @param window window reference(optional)
 * @example webapp.typetext({selector:'#btn',text:'hello world',frame:'#layoutFrame', window:window})
 * webapp.typetext({selector:'#btn',text:'hello world',frame:'#layoutFrame'})
 * webapp.typetext({selector:'#btn',text:'hello world'})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const typeText = async (args: { selector: string; text: string; frame?: string; window?: Page }) => {
  const pg = args.window ? args.window : args.frame ? pw.frameLocator(args.frame) : pw;
  try {
    log.info(`Trying to get the selector ${args.selector} `);
    await pg.locator(args.selector).fill(args.text);
    log.info(`Sent Text ${args.text} to element ${args.selector}`);
  } catch (ex) {
    log.error(`Unable to find the element ${args.selector}`);
  }
};
/**
 * This method is used to wait for service calls / page loads
 * @example webapp.waitUntilPageIsLoaded()
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitUntilPageIsLoaded = async () => {
  try {
    log.info('Waiting for Network calls');
    await Promise.all([
      pw.waitForLoadState('domcontentloaded'),
      pw.waitForLoadState('networkidle', { timeout: 30000 }),
    ]);
  } catch {
    log.error('Timed out waiting for load state');
  }
};
/**
 * This method is used to wait for certain condition to be met such as an element becoming visible or clickable
 * @example webapp.waitForDocumentLoaded()
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForDocumentLoaded = async () => {
  pw.waitForTimeout(8000);
  log.info('Waiting done for 8 seconds');
};
/**
 * This method returns true if element exists and false when element doesnt exist
 * @param selector selector of element
 * @param frame frame selector(optional)
 * @param window window reference(optional)
 * @example webapp.checkIfElementExists({selector:'#btn',frame:'#layoutFrame',window:window})
 * webapp.checkIfElementExists({selector:'#btn',frame:'#layoutFrame'})
 * webapp.checkIfElementExists({selector:'#btn'})
 * @returns boolean
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const checkIfElementExists = async (args: { selector: string; frame?: string; window?: Page }) => {
  log.info(`checking if element ${args.selector} exists`);
  const pg = args.frame ? await pw.frame(args.frame.replace('#', ''))?.$$(args.selector) : await pw.$$(args.selector);
  log.info(`element with selector ${args.selector} ${pg && pg!.length > 0 ? 'exists' : 'does not exist'}`);
  return pg ? pg!.length > 0 : false;
};

/**
 * This method returns true if element doesnt exist and false when element exists
 * @param selector element selector
 * @param frame frame selector (optional)
 * @example webapp.checkIfElementNotExists({selector:'#btn',frame:'#layoutFrame'})
 * webapp.checkIfElementNotExists({selector:'#btn'})
 * @returns boolean
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const checkIfElementNotExists = async (args: { selector: string; frame?: string }) => {
  log.info(`checking if element ${args.selector} does not exists`);
  const pg = args.frame ? await pw.frame(args.frame.replace('#', ''))?.$$(args.selector) : await pw.$$(args.selector);
  return pg!.length > 0;
};
/**
 * This method is used to get the attribute value of the element with attribute value
 * as passed in the method
 * @param selector element selector
 * @param frame frame selector (optional)
 * @param occurance nth occurance on which action has to be performed (optional)
 * @param attributeName attribute for which value has to be extracted
 * @returns string
 */
const getAttributeValue = async (args: {
  selector: string;
  frame?: string;
  occurance?: number;
  attributeName: string;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  const elCnt = await pg.locator(args.selector).count();
  log.info(`No of elements found with locator ${args.selector} are ${elCnt}`);
  const element =
    elCnt > 1
      ? await pg.locator(args.selector).nth(args.occurance ? args.occurance : 1)
      : await pg.locator(args.selector);
  // eslint-disable-next-line no-return-await
  return await element.getAttribute(args.attributeName);
};
/**
 * This method is used to get the text of the element
 * @param selector element selector
 * @param frame frame selector(optionals)
 * @returns string
 */
const getText = async (args: { selector: string; frame?: string }): Promise<string | any> => {
  await waitForElementVisible({ selector: args.selector, frame: args.frame });
  await isElementEnabled({ selector: args.selector, frame: args.frame });
  log.info(`Getting text of ${JSON.stringify(args.selector)}`);
  const element = await getElement({ selector: args.selector, frame: args.frame });
  // eslint-disable-next-line no-return-await
  return await element.textContent();
};

/**
 * Waits until element is visible
 * @param selector element selector
 * @param frame frame selector(optional)
 * @param timeout timeout in millisec(optional)
 * @example webapp.waitForElementVisible({selector:'#btn',frame:'#layoutFrame'},30000)
 * webapp.waitForElementVisible({selector:'#btn'},30000)
 *  // if timeout is not provided then default timeout is 30000 milli sec
 * webapp.waitForElementVisible({selector:'#btn'})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForElementVisible = async (
  args: { selector: string; frame?: string },
  timeout = defaultConfig.retryTimeout
): Promise<boolean> => {
  log.debug(`Waiting for element ${JSON.stringify(args.selector)} to be visible`);
  await retryWithTimeout(
    async () => {
      // eslint-disable-next-line no-return-await
      return await isElementVisible({ selector: args.selector, frame: args.frame });
    },
    timeoutErrorAction(`Element ${JSON.stringify(args.selector)} is not visible`),
    timeout
  );
  return true;
};
/**
 * checks if element is visible
 * @param selector element selector
 * @param frame frame selector(optional)
 * @example webapp.isElementVisible({selector:'#btn',frame:'#layoutFrame'})
 * webapp.isElementVisible({selector:'#btn'})
 * @returns boolean
 */
const isElementVisible = async (args: { selector: string; frame?: string }): Promise<boolean> => {
  try {
    const element = await getElement({ selector: args.selector, frame: args.frame });
    log.debug(`Checking if element ${JSON.stringify(args.selector)} is displayed`);
    return element.isVisible();
  } catch (error) {
    return false;
  }
};

/**
 * checks if the element is enabled returns boolean
 * @param selector element selector
 * @param frame frame selector(optional)
 * @example webapp.isElementEnabled({selector:'#btn',frame:'#layoutFrame'})
 * webapp.isElementEnabled({selector:'#btn'})
 * @returns boolean
 */
const isElementEnabled = async (args: { selector: string; frame?: string }): Promise<boolean> => {
  const element = await getElement({ selector: args.selector, frame: args.frame });
  log.debug(`Checking if element ${JSON.stringify(args.selector)} is enabled`);
  return element.isEnabled();
};

/**
 * checks if the element is disabled returns boolean
 * @param selector element selector
 * @param frame frame selector(optional)
 * @example webapp.isElementDisabled({selector:'#btn',frame:'#layoutFrame'})
 * webapp.isElementDisabled({selector:'#btn'})
 * @returns boolean
 */
const isElementDisabled = async (args: { selector: string; frame?: string }): Promise<boolean> => {
  const element = await getElement({ selector: args.selector, frame: args.frame });
  log.debug(`Checking if element ${JSON.stringify(args.selector)} is disabled`);
  return element.isDisabled();
};

/**
 * method used to run the timeout error action
 * @param errorMessage
 */
const timeoutErrorAction = (errorMessage: string) => {
  return () => {
    throw new Error(errorMessage);
  };
};

/**
 * waits for the element to disappear
 * @param selector element selector
 * @param frame frame selector(optional)
 * @param timeout timeout for the action(optional)
 * @example webapp.waitForElementToDisappear({selector:'#btn',frame:'#layoutFrame'})
 * webapp.waitForElementToDisappear({selector:'#btn'})
 */
const waitForElementToDisappear = async (
  args: { selector: string; frame?: string },
  timeout = defaultConfig.retryTimeout
): Promise<void> => {
  log.info(`Waiting for element ${JSON.stringify(args.selector)} to disappear`);
  await retryWithTimeout(
    async () => {
      return !(await isElementVisible({ selector: args.selector, frame: args.frame }));
    },
    timeoutErrorAction(`Element ${JSON.stringify(args.selector)} is not visible`),
    timeout
  );
};

/**
 * Gets the element reference
 * @param selector element selector
 * @param frame frame selector (optional)
 * @param occurance nth element on which action has to happen (optional)
 * @example webapp.getElement({selector:'#btn',frame:'#layoutFrame',occurance:1})
 * webapp.getElement({selector:'#btn',frame:'#layoutFrame'})
 * webapp.getElement({selector:'#btn'})
 * @returns element
 */
const getElement = async (args: { selector: string; frame?: string; occurance?: number }): Promise<Locator> => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : pw;
  const elCnt = await pg.locator(args.selector).count();
  log.info(`No of elements found with locator ${args.selector} are ${elCnt}`);
  return elCnt > 1
    ? // eslint-disable-next-line no-return-await
      await pg.locator(args.selector).nth(args.occurance ? args.occurance : 0)
    : // eslint-disable-next-line no-return-await
      await pg.locator(args.selector);
};
// eslint-disable-next-line jsdoc/require-description
/**
 * @param selector element selector
 * @param frame frame selector (optional)
 * @example webapp.getElement({selector:'#btn',frame:'#layoutFrame'})
 * webapp.getElement({selector:'#btn',frame:'#layoutFrame'})
 * webapp.getElement({selector:'#btn'})
 * @returns NoOfElements
 */
const getElementsLength = async (args: { selector: string; frame?: string }): Promise<number> => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  log.info(`Clicking on element with selector ${args.selector}`);

  const noOfElementsFound = await pg.locator(args.selector).count();

  return noOfElementsFound;
};

/**
 * This method gets all the string contents of matching elements with selector passed
 * @param selector element selector
 * @param frame frame selector(optional)
 * @example webapp.getAllTextContents({selector:'#btn',frame:'#layoutFrame'})
 * webapp.getAllTextContents({selector:'#btn'})
 * @returns string[]
 */
const getAllTextContents = async (args: { selector: string; frame?: string }): Promise<string[]> => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : pw;
  // eslint-disable-next-line no-return-await
  return await pg.locator(args.selector).allTextContents();
};
/**
 * This method captures the screenshot and returns the image buffer
 * @param fileName
 * @returns image(base64)
 */
const screenshotSave = async (fileName: string): Promise<any> => {
  if (pw !== undefined) {
    log.info(`Saving screenshot: ${fileName}`);
    const dir = path.dirname(fileName);
    if (!fs.existsSync(dir)) {
      log.debug('Screenshot folder does not exist');
      fs.mkdirSync(dir);
      log.debug('Screenshot folder created');
    }
    const image = (await pw.screenshot()).toString('base64');
    fs.writeFileSync(fileName, image, 'base64');
    log.info(`Screenshot saved: ${fileName}`);
    return image;
  }
};
/**
 * This method is to get the download path of the file that is downloaded
 * Pass in the selector that is required to be clicked for downloading the file
 *
 * @param selector element selector
 * @param frame frame selector (optional)
 * @returns string (path)
 * @example const Path=downloadFile({selector:'#btn',frame:'#layoutFrame'})
 * const Path=downloadFile({selector:'#btn'})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const downloadFile = async (args: { selector: string; frame?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  const downloadPromise = pw.waitForEvent('download');
  await pg.locator(args.selector).click();
  const download = await downloadPromise;
  // eslint-disable-next-line no-return-await
  return await download.path();
};

/**
 * This method is to get the download path of the file that is downloaded
 * Pass in the selector that is required to be clicked for downloading the file
 *
 * @param selector element selector
 * @param frame frame selector (optional)
 * @returns string (path)
 * @example const Path=downloadFile({selector:'#btn',frame:'#layoutFrame'})
 * const Path=downloadFile({selector:'#btn'})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const downloadimportTemplate = async (args: { selector: string; frame?: string; fileName: string }) => {
  log.info(`checking if element ${args.selector} does not exists`);
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  const downloadPromise = pw.waitForEvent('download');
  await pg.locator(args.selector).click();
  const download = await downloadPromise;
  // eslint-disable-next-line no-return-await
  return await download.path();
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitUntilSelectorDisappear = async (args: { selector: string; frame?: string }) => {
  await sleep(1000);
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  // eslint-disable-next-line no-return-await
  return await pg.waitForSelector(args.selector, { state: 'detached' });
};
/**
 * This method is to get the Upload  the file
 * Pass in the selector that is required to be clicked for downloading the file
 *
 * @param selector element selector
 * @param frame frame selector (optional)
 */
const uploadfile = async (args: {
  filePath: string;
  selector: string;
  frame?: string;
  occurance?: number;
  timeout?: number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  log.info(`UploadFile on element with selector ${args.selector}`);
  try {
    const noOfElementsFound = await pg.locator(args.selector).count();
    if (noOfElementsFound > 1) {
      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .waitFor({ timeout: args.timeout ? args.timeout : 30000 });

      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .setInputFiles(args.filePath);
    } else {
      await pg.locator(args.selector).waitFor();
      await pg.locator(args.selector).setInputFiles(args.filePath);
    }
  } catch (ex) {
    log.error(`uploadFile ${args.selector} failed with exception ${ex}`);
  }
};
/**
 * Select the dropdown option for the dropdown element. Takes the element reference as input
 * and option to be selected
 * @param selector element selector
 * @param frame frame selector(optional)
 * @param option dropdown option to be selected
 * @example mobileapp.selectDropdownOption({selector:'#dropdown',frame:'#layoutFrame',option:'<option>'})
 * mobileapp.selectDropdownOption({selector:'#dropdown',option:'<option>'})
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectDropdownOption = async (args: { selector: string; frame?: string; option: string }) => {
  const dropdown: Locator = await getElement({
    selector: args.selector,
    frame: args.frame,
  });
  dropdown.selectOption(args.option);
};

// eslint-disable-next-line jsdoc/require-description
/**
 *
 * @param args selector of element and Frame selector if any
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const scrollIntoView = async (args: { selector: string; frame?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  pg.locator(args.selector).scrollIntoViewIfNeeded();
  log.info(`scrolled until the element with selector ${args.selector} is in view`);
};

/**
 * Get the frame reference
 * @param args Pass in the Selector for selecting the frame
 * @returns
 */

/**
 * This method is to get the download paths of the files that are downloaded
 * Pass in the selector that is required to be clicked for downloading the file
 * @param selector element selector
 * @param frame frame of selector (optional)
 * @returns string[] (paths)
 * @example const Path=downloadMultipleFiles({selector:'#btn',frame:'#layoutFrame',noOfFiles:2})
 * const Path=downloadMultipleFiles({selector:'#btn',noOfFiles:2})
 */
const downloadMultipleFiles = async (args: { selector: string; frame?: string; noOfFiles: number }): Promise<any[]> => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  return new Promise(async (resolve) => {
    const paths: any[] = [];
    pw.on('download', async (download: Download) => {
      paths.push(await download.path());
      if (args.noOfFiles === paths.length) {
        resolve(paths);
      }
    });
    pg.locator(args.selector).click();
  });
};
/**
 * Click On An Element With text
 * @param selector Pass the selector of element for which Click action has to be performed
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const clickUsingText = async (args: { text: string; frame?: string; occurance?: number }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : pw;
  log.info(`Clicking on element with text ${args.text}`);
  try {
    const noOfElementsFound = await pg.locator(`text=${args.text}`).count();
    if (noOfElementsFound > 1) {
      await pg
        .locator(`text=${args.text}`)
        .nth(args.occurance ? args.occurance : 1)
        .click();
    } else {
      await pg.locator(`text=${args.text}`).click();
    }
  } catch (ex) {
    log.error(`Clicking on element with text ${args.text} failed with exception ${ex}`);
  }
};

/*
 *  This method is used to click ok or cancel buttons in the popup
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handlePopup = async (buttonToClick: string, frame?: string) => {
  const attributeValue = await getAttributeValue({ attributeName: 'class', selector: 'body[id*=ext-gen]', frame });
  if (attributeValue!.includes('x-body-masked')) {
    await click({ selector: buttonToClick, frame });
  }
};

// eslint-disable-next-line jsdoc/require-description
/**
 *
 * @param text dropdown Item text
 * @param frame frame selector
 * @returns returns dropdowm
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getDropDownItemWithText = async (args: { selector?: string; frame?: string; text: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  log.info(`Getting the dropdown Item with text ${args.text}`);
  // eslint-disable-next-line no-return-await
  return await pg.locator(`li[role="option"]:has-text("${args.text}")`);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const hover = async (args: { selector: string; frame?: string; options?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  await pg.locator(args.selector).hover();
};
/**
 * Focus the given element.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const focus = async (args: { selector: string; frame?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  await pg.locator(args.selector).focus();
  log.info(`Focussed element ${args.selector}`);
};
/**
 * Allows to enter the Keyboard letters as input.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const keyboardType = async (args: { inputString: string; frame?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  await pg.keyboard.type(args.inputString);
  log.info(`Focussed element ${args.inputString}`);
};
/**
 * Returns all the inner texts content.
 */
const getallInnerTexts = async (args: { selector: string; options?: string; frame?: string }): Promise<any[]> => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : pw;
  // eslint-disable-next-line no-return-await
  return await pg.locator(args.selector).allInnerTexts();
};
/**
 * Returns element specified by selector when it satisfies `state` option. Returns `null` if waiting for `hidden` or
 * `detached`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForSelector = async (args: { selector: string; frame?: string }) => {
  await sleep(1000);
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  // eslint-disable-next-line no-return-await
  return await pg.waitForSelector(args.selector);
};
/*
 * This method is used to get the url of the current page
 * @url returns the current page url
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getCurrentUrl = async () => {
  const pg: Page | any = await pw;
  const url = await pg.url();
  return url;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForTimeout = async (WaitTime: number) => {
  const pg: Page | any = await pw;
  await pg.waitForTimeout(WaitTime);
};

/**
 * /*
 * Wait Until The Element With Specified Selector Is Visible. In Case Of Multiple
 * Elements, It Waits For The Specified Occurance
 * @param selector Selector of the element
 * @param multiple Whether Selector returns multiple elements
 * @param occurance which occurance to wait for if there are multiple occurances
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForLocator = async (args: { selector: string; multiple?: boolean; occurance?: number; frame?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  if (args.multiple) {
    await pg
      .locator(args.selector)
      .nth(args.occurance ? args.occurance : 1)
      .waitFor({ timeout: 30000 });
  } else {
    await await pg.locator(args.selector).waitFor({ timeout: 30000 });
  }
  log.info(`Element with selector ${args.selector} found !!`);
};
/**
 * This method is used to expand Dropdown Item
 *
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const expandDropDownItem = async (args: { selector: string; frame?: string }) => {
  const dropdownElement = await getElement(args);
  dropdownElement.locator('[arialabel="downArrow"]').click();
  log.info(`Expanded Dropdown Item with selector ${args.selector}`);
};
/**
 * Selects the Item with text in dropdown
 * @param text text of the element to be selected
 * @param frame frame selector if any     *
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectDropDownOption = async (args: { text: string; frame?: string }) => {
  // get dropdown option
  await (await getDropDownItemWithText({ text: args.text, frame: args.frame })).click();
  log.info(`clicked on dropdown Item with text ${args.text}`);
};
// eslint-disable-next-line jsdoc/require-description
/**
 *
 * @param args Wait for Specific API calls
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForApiCalls = async (args: { endpoints: string[]; action: any }) => {
  log.info(`waiting for API calls ${args.endpoints}`);
  const promises: any = [];
  promises.push(args.action);
  promises.push(pw.waitForTimeout(2000));
  args.endpoints.forEach((endpoint) => {
    promises.push(pw.waitForResponse(`**${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}*`));
  });
  const [response] = await Promise.all(promises);
  return response;
};
/**
 * To select the Merchnat Store .
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectMerchantRow = async (merchant: string) => {
  await (await (await getElement({ selector: `//td[text()='${merchant}']` })).first()).click();
  log.info(`selecting the merchant ${merchant}`);
};

/**
 * To Upload the file at the specific selector by giving the filepath
 *
 */

const uploadFile = async (args: {
  filePath: string;
  selector: string;
  frame?: string;
  occurance?: number;
  timeout?: number;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  log.info(`UploadFile on element with selector ${args.selector}`);
  try {
    const noOfElementsFound = await pg.locator(args.selector).count();
    if (noOfElementsFound > 1) {
      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .waitFor({ timeout: args.timeout ? args.timeout : 30000 });

      await pg
        .locator(args.selector)
        .nth(args.occurance ? args.occurance : 1)
        .setInputFiles(args.filePath);
    } else {
      await pg.locator(args.selector).waitFor();
      await pg.locator(args.selector).setInputFiles(args.filePath);
    }
  } catch (ex) {
    log.error(`uploadFile ${args.selector} failed with exception ${ex}`);
  }
};

/*
 *To wait for poup window to open
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const waitForWindow = async (clickEvent: any, expectedUrl: string) => {
  const pg: Page | any = await pw;
  const [popup] = await Promise.all([pg.waitForEvent('popup'), clickEvent]);
  await popup.waitForLoadState();
  expect(await popup.url()).toBe(expectedUrl);
  return popup;
};

/**
 * Checks if element can be found based on text
 * @param text the text to look for
 * @param frame frame selector(optional)
 * @returns boolean (true if element found, false if element is not found)
 */
const elementExistsByText = async (text: string, frame: string = ''): Promise<boolean> => {
  try {
    const textSelector = `text="${text}"`;
    if (frame === '') {
      return await checkIfElementExists({ selector: textSelector });
    }
    return await checkIfElementExists({ selector: textSelector, frame });
  } catch (error) {
    return false;
  }
};
/* Used to press keyboard keys */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const keyboard = async (args: { keyboardEvent: string; frame?: string }) => {
  const pg: Page | any = args.frame ? await getFrame({ selector: args.frame }) : await pw;
  await pg.keyboard.press(args.keyboardEvent);
  log.info(`Focussed element ${args.keyboardEvent}`);
};
export default {
  click,
  clear,
  isElementEnabled,
  isElementDisabled,
  waitUntilPageIsLoaded,
  typeText,
  checkIfElementExists,
  checkIfElementNotExists,
  getElement,
  getAttributeValue,
  isElementVisible,
  waitForElementVisible,
  doubleClick,
  getText,
  waitForElementToDisappear,
  screenshotSave,
  getAllTextContents,
  downloadFile,
  selectDropdownOption,
  getElementsLength,
  clickUsingText,
  downloadMultipleFiles,
  scrollIntoView,
  waitUntilSelectorDisappear,
  handlePopup,
  getDropDownItemWithText,
  hover,
  focus,
  keyboardType,
  waitForLocator,
  waitForApiCalls,
  selectMerchantRow,
  getallInnerTexts,
  waitForSelector,
  uploadFile,
  getCurrentUrl,
  expandDropDownItem,
  selectDropDownOption,
  waitForWindow,
  waitForTimeout,
  waitForDocumentLoaded,
  downloadimportTemplate,
  uploadfile,
  elementExistsByText,
  keyboard,
};
