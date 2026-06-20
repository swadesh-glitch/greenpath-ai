import { test, expect } from "@playwright/test"

test.describe("GreenPath AI E2E User Journey", () => {
  test("should complete onboarding and navigate to garden & analysis dashboards", async ({ page }) => {
    test.setTimeout(90000)
    // 1. Visit landing page
    await page.goto("/")
    await expect(page).toHaveTitle(/GreenPath/i)

    // 2. Click CTA to start journey (navigates to /onboarding)
    await page.click("text=Start My Climate Journey")
    await expect(page).toHaveURL(/\/onboarding/)

    // 3. Complete Clover's Conversational Chat Onboarding
    // Step 0: Name input
    await page.fill('input[placeholder="Enter your name..."]', "Eco Traveler")
    await page.click('button:has-text("Continue")')

    // Step 1: City input
    await page.fill('input[placeholder="Enter your city..."]', "Oslo")
    await page.click('button:has-text("Continue")')

    // Step 2: Transit options
    await page.click('button:has-text("Walk or bike often")')

    // Step 3: Food options
    await page.click('button:has-text("Vegetarian lifestyle")')

    // Step 4: Shopping options
    await page.click('button:has-text("Minimalist")')

    // Step 5: Energy options
    await page.click('button:has-text("Solar clean power")')

    // 4. Discover/Reveal Steps
    // Step 1: Identity Card
    await page.click('button:has-text("Discover Your Carbon Story")')

    // Step 2: Story Assessment
    await page.click('button:has-text("Visualize Your Future Twin")')

    // Step 3: Carbon Equivalents
    await page.click('button:has-text("Review Climate Action Plan")')

    // Step 4: Activated challenges -> redirect to Garden
    await page.click('button:has-text("Enter My Carbon Garden")')
    await expect(page).toHaveURL(/\/garden/)

    // 5. Navigate to Missions and log action
    await page.click('text=AI Missions')
    await expect(page).toHaveURL(/\/missions/)
    
    // 6. Navigate to Analysis and check Twin Simulator
    await page.click('text=Carbon Story')
    await expect(page).toHaveURL(/\/analysis/)
  })
})
