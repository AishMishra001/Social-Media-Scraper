const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeInstagramProfile(url) {
  const browser = await puppeteer.launch({ headless: false }); // Use headless: true for production
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector('h2[dir="auto"]', { timeout: 30000 });

    await new Promise(resolve => setTimeout(resolve, 5000));


    const profileData = await page.evaluate(() => {
      try {
        const username = document.querySelector('h2[dir="auto"]')?.textContent.trim() || "No username";

        const fullNameElement = document.querySelector('div > span[class*="x1lliihq"]');
        const fullName = fullNameElement?.textContent.trim() || "No full name";

        const bioElement = document.querySelector('div > span[class*="_aade"]');
        const bio = bioElement?.textContent.trim() || "No bio";

        const stats = Array.from(document.querySelectorAll("ul li span span"));
        const posts = stats[0]?.textContent || "No posts";
        const followers = stats[1]?.textContent || "No followers";
        const following = stats[2]?.textContent || "No following";

        return { username, fullName, bio, posts, followers, following };
      } catch (error) {
        console.error("Error extracting profile data:", error);
        return { error: "Failed to extract profile data" };
      }
    });

    console.log(profileData);

    fs.writeFileSync("instagramProfileData.json", JSON.stringify(profileData, null, 2));
  } catch (error) {
    console.error("Error navigating to profile:", error);
  } finally {
    await browser.close();
  }
}

const profileUrl = "https://www.instagram.com/bikashshaw78?igsh=b3lxcThuZm4yN29n";
scrapeInstagramProfile(profileUrl);
