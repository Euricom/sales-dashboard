import { test as setup, expect } from "@playwright/test";
const authFile = "playwright/.auth/user.json";

setup("authenticateAzure", async ({ page }) => {
  const azureMail = process.env.TEST_AZURE_MAIL!;
  const azurePassword = process.env.TEST_AZURE_PASSWORD!;
  expect(azureMail).not.toBeNull();
  expect(azurePassword).not.toBeNull();

  // Navigate to the page
  await page.goto("/");

  await page.pause();
  // Sign in to the app
  const signInButton = page.getByRole("button");
  await signInButton.click();

  const signInButtonAzure = page.getByRole("button");
  await signInButtonAzure.click();

  await page.waitForTimeout(500);

  // Enter credentials
  const emailInput = page.locator("input[type=email]");
  await emailInput.waitFor();
  await emailInput.click();
  await emailInput.fill(azureMail);

  await page.getByRole("button", { name: "Next" }).click();

  const passwordInput = page.locator("input[type=password]");
  await passwordInput.waitFor();
  await passwordInput.click();
  await passwordInput.fill(azurePassword);

  await page.locator("input[type=submit][value='Sign in']").click();
  await page.locator("input[type=submit][value='Yes']").click();

  await page.context().storageState({ path: authFile });
});
