import { test, expect } from "@playwright/test";

test.describe(() => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("clicking CollapsibleTrigger toggles content visibility", async ({
    page,
  }) => {    
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Navigate to the page
    await page.goto("/");

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
    const collapsibleContents = await page.$$(".CollapsibleContent");
    for (const content of collapsibleContents) {
      const isContentVisible = await content?.isVisible();
      // Assert that the Collapsible content is visible
      expect(isContentVisible).toBeTruthy();
      // Click the trigger again to hide the content
      await collapsibleTrigger?.click();
      // Wait for animation to complete
      await page.waitForTimeout(500);
      // Check if the Collapsible content is hidden
      const isContentHidden = await content?.isVisible();
      // Assert that the Collapsible content is hidden after clicking the trigger
      expect(isContentHidden).toBeFalsy();
    }
  });
});

test.describe("employees collapsed group test", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test("employees collapsed group test", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 500, height: 1080 });
    // Navigate to the page
    await page.goto("/");

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
    const collapsibleContents = await page.$$(".CollapsibleContent");
    for (const content of collapsibleContents) {
      const isContentHidden = await content?.isVisible();
      // Assert that the Collapsible content is visible
      expect(isContentHidden).toBeFalsy();
      // Click the trigger again to hide the content
      await collapsibleTrigger?.click();
      // Wait for animation to complete
      await page.waitForTimeout(500);
      // Check if the Collapsible content is hidden
      const isContentVisible = await content?.isVisible();
      // Assert that the Collapsible content is hidden after clicking the trigger
      expect(isContentVisible).toBeTruthy();
    }
  });
});
