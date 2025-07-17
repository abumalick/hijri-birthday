import { test, expect } from "@playwright/test";

test("add new event", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("add-event-button").click();

  await expect(page).toHaveURL("/add");

  await page.getByTestId("name-input").fill("Test Event");
  await page.getByTestId("gregorian-date-input").fill("2024-01-01");

  await expect(page.getByTestId("hijri-date-preview")).toHaveText(
    "Jumada II 19, 1445 AH"
  );

  await page.getByTestId("submit-button").click();

  await expect(page).toHaveURL("/");

  const eventCard = page.getByTestId("event-card").first();
  await expect(eventCard.getByTestId("event-name")).toHaveText("Test Event");
});
