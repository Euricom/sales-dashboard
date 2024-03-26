import {test } from "@playwright/test";

test.describe("Teamleader API test", () => {
    test("Test wether the deals are visible", async ({ page }) => {

      await page.goto("/");
      const dealsColumn = page.getByTitle("DealsColumn");
      await dealsColumn.isVisible();

      const dealCards = await page.$$('.DealCard');
      for (const dealCard of dealCards) {
        await dealCard.isVisible();
      }

    });
});
