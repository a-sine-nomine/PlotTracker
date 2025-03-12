import { test, expect } from "@playwright/test";

test.describe("Homepage E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");

    await page.locator("input#username").fill("user");
    await page.locator("input#password").fill("password");

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/auth/login")),
      page.locator('button:has-text("Login")').click(),
    ]);

    await expect(page).toHaveURL("/homepage");
  });

  test("Fetches and displays stories", async ({ page }) => {
    const storiesResponse = await page.waitForResponse((resp) =>
      resp.url().includes("/api/stories")
    );

    expect(storiesResponse.status()).toBe(200);

    await expect(page.locator(".story-text")).toContainText("Test story");
  });

  test("Renames a story", async ({ page }) => {
    await page.waitForResponse((resp) => resp.url().includes("/api/stories"));

    const storyRow = page.locator(".story-title", {
      hasText: "Test story",
    });

    await storyRow.locator(".edit-icon").click();

    await storyRow.locator('input[type="text"]').fill("Renamed Story Title");

    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/stories/")),
      storyRow.locator('button:has-text("Save")').click(),
    ]);

    await expect(storyRow.locator(".story-text")).toHaveText(
      "Renamed Story Title"
    );
  });

  test("Deletes a story", async ({ page }) => {
    await page.waitForResponse((resp) => resp.url().includes("/api/stories"));

    const storyRow = page.locator(".story-title", {
      hasText: "Renamed Story Title",
    });

    await storyRow.locator(".delete-icon").click();

    const modal = page.locator(".modal-content");
    await expect(modal).toBeVisible();
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/stories/")),
      modal.locator("button.btn-danger").click(),
    ]);

    await expect(storyRow).toHaveCount(0);
  });

  test("Clicking a story navigates to /story/:storyId", async ({ page }) => {
    await page.waitForResponse((resp) => resp.url().includes("/api/stories"));

    const storyRow = page.locator(".story-title", { hasText: "Test story 2" });

    await storyRow.click();

    await expect(page).toHaveURL(/\/story\/\6002+$/);
  });
});
