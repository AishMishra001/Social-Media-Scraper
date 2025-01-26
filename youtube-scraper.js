const puppeteer = require('puppeteer');
const fs = require('fs');


async function scrapeYouTubeVideo(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });

    await page.waitForSelector('h1.ytd-watch-metadata', { timeout: 15000 });

    const videoData = await page.evaluate(() => {
        const title = document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim() || 'No title';

        const views = document.querySelector('span.view-count')?.textContent?.trim() || 'No views';

        const likeElement = Array.from(document.querySelectorAll('.yt-spec-button-shape-next__button-text-content'))
            .find(el => el.textContent.match(/^\d/));
        const likes = likeElement ? likeElement.textContent.trim() : 'No likes';

        const uploadDate = document.querySelector('#info-strings yt-formatted-string')?.textContent?.trim() || 'No date';

        const jsonData = document.querySelectorAll('.yt-core-attributed-string--link-inherit-color');
        let formattedDescription = '';
        
        for (let i = 0; i < jsonData.length; ++i) {
            const textContent = jsonData[i].textContent.trim();
        
            if (textContent) {
                formattedDescription += `${textContent}\n\n`;
            }
        }

        const description = formattedDescription ? formattedDescription : 'No description available';
        
        return {
            title,
            views,
            likes,
            uploadDate,
            description
        };
    });

    console.log(videoData);

    fs.writeFileSync('videoData.json', JSON.stringify(videoData, null, 2));

    await browser.close();
}

const videoUrl = 'https://www.youtube.com/watch?v=EVmbe3TfyeM';
scrapeYouTubeVideo(videoUrl);