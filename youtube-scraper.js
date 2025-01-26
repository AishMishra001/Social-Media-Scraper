const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeYouTubeVideo(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set user-agent to mimic a browser
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scrape video details
    const videoData = await page.evaluate(() => {
        const title = document.querySelector('h1.title')?.innerText || 'No title';
        const views = document.querySelector('span.view-count')?.innerText || 'No views';
        const likes = document.querySelector('button.like-button-renderer-like-button span')?.innerText || 'No likes';
        const uploadDate = document.querySelector('div#date')?.innerText || 'No date';
        const description = document.querySelector('yt-formatted-string.content')?.innerText || 'No description';

        return { title, views, likes, uploadDate, description };
    });

    console.log(videoData);

    // Save data to JSON
    fs.writeFileSync('videoData.json', JSON.stringify(videoData, null, 2));

    await browser.close();
}

const videoUrl = 'https://www.youtube.com/watch?v=zRnrq24crDI';
scrapeYouTubeVideo(videoUrl);
