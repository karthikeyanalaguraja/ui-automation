export enum Navigation {
    dashboardLink = "//span[contains(text(),'Dashboard')]",
    caseManagementLink = "//span[contains(text(),'Case Management')]",
    customerManagementLink = "//span[contains(text(),'Customer Management')]",
    customerSubLink = "//ul[@class='MuiList-root MuiList-padding css-1ssc79j-MuiList-root']//li[1]//div//span[contains(text(),'Customer')]",
    solutionSubLink = "//span[contains(text(),'Solution')]",
    pricingSubLink = "//span[contains(text(),'Pricing')]",
    settingsSubLink = "//ul[@class='MuiList-root MuiList-padding css-1ssc79j-MuiList-root']//li[4]//span[contains(text(),'Settings')]",
    contractLink = "//span[contains(text(),'Contracts')]",
    paymentLink = "//span[contains(text(),'Payments')]",
    settingsBottomLink = "//ul[@id='navBarBottomItems']//span[contains(text(),'Settings')]",
    reduceMenuLink = "//span[contains(text(),'Reduce menu')]",
}