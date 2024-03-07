import { test, expect } from "@playwright/test";

test.describe(() => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("clicking CollapsibleTrigger toggles content visibility", async ({
    page,
  }) => {
    // Navigate to the page
    await page.goto("/");

    // workaround for sign in to azure, for some reason you need to login twice
    const signInButton = page.getByRole("button");
    await signInButton.click();

    const signInButtonAzure = page.getByRole("button");
    await signInButtonAzure.click();

    await page.waitForTimeout(500);
    // Find the Collapsible trigger element and click it
    const collapsibleTrigger = page
      .getByRole("button")
      .and(page.getByTitle("CollapsibleTrigger"));
    if (collapsibleTrigger === null) {
      throw new Error("Collapsible trigger not found");
    }
    // Wait for data to load
    await page.waitForTimeout(500);
    // Check if the Collapsible content is visible
    const collapsibleContent = page.getByTitle("CollapsibleContent");
    const isContentVisible = await collapsibleContent?.isVisible();
    // Assert that the Collapsible content is visible
    expect(isContentVisible).toBeTruthy();
    // Click the trigger again to hide the content
    await collapsibleTrigger?.click();
    // Wait for animation to complete
    await page.waitForTimeout(500);
    // Check if the Collapsible content is hidden
    const isContentHidden = await collapsibleContent?.isVisible();
    // Assert that the Collapsible content is hidden after clicking the trigger
    expect(isContentHidden).toBeFalsy();
  });
});
