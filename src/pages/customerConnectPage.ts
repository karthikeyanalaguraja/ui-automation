import { expect, Page } from '@playwright/test';
import PlaywrightWrapper from '../helper/PlayWrightWrapper';

export default class customerConnectPage {
  private base: PlaywrightWrapper;


  constructor(private page: Page) {
    this.base = new PlaywrightWrapper(page);
  }

  // async navigateToCustomerConnectPage(): Promise<void> {
  //   const CUSTOMER_CONNECT_URL = 'https://customer-connect.qa1-core.aws.converadev.com/';
  //   await this.base.goto(CUSTOMER_CONNECT_URL);
  //   await this.page.waitForLoadState();
  //   await this.page.waitForURL(CUSTOMER_CONNECT_URL);
  // }

  // async validateLeftNavigation(): Promise<void> {
  //   await this.page.isVisible(this.elements.dashboardLink);
  //   await this.page.isVisible(this.elements.caseManagementLink);
  //   await this.page.isVisible(this.elements.customerManagementLink);
  //   await this.page.isVisible(this.elements.solutionSubLink);
  //   await this.page.isVisible(this.elements.pricingSubLink);
  //   await this.page.isVisible(this.elements.contractLink);
  //   await this.page.isVisible(this.elements.paymentLink);
  // }

  // async searchForCustomer(customerName: string): Promise<void> {
  //   await this.page.click(this.elements.customerManagementLink);
  //   await this.page.click(this.elements.changeCustomer);
  //   await this.page.fill(this.elements.nameField, customerName);
  //   await this.page.click(this.elements.searchField);
  //   const result = await this.elements.noCustomerFound;
  //   expect(result.trim()).toBe('No Records found');
  // }
}
