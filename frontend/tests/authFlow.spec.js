import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  const username = "TestUser";
  const password = "TestPassword";

  test("Register a new user", async ({ page }) => {
    await page.goto("/register");

    await page.locator("input#username").fill(username);
    await page.locator("input#password").fill(password);

    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/auth/register")),
      page.locator('button:has-text("Sign up")').click(),
    ]);

    expect(response.status()).toBe(201);

    await expect(page.locator(".text-success")).toContainText(/success/i);
  });

  test("Login with existing user", async ({ page }) => {
    await page.goto("/login");

    await page.locator("input#username").fill(username);
    await page.locator("input#password").fill(password);

    const [response] = await Promise.all([
      page.waitForResponse((resp) => resp.url().includes("/api/auth/login")),
      page.locator('button:has-text("Login")').click(),
    ]);

    expect(response.status()).toBe(200);

    await expect(page).toHaveURL("/homepage");
  });

  test("Protected route redirects if not logged in", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/homepage");

    await expect(page).toHaveURL(/\/login/);
  });
});
