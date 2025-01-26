const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeYouTubeVideo(url) {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    // Set more comprehensive user-agent
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Increase timeout and add more navigation options
    await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
    });

    // Scroll to ensure all content is loaded
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
    });

    // Wait for key selectors to be available
    await page.waitForSelector('h1.ytd-watch-metadata', { timeout: 10000 });

    const videoData = await page.evaluate(() => {
        // More robust title selection
        const title = document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim() || 
                      document.querySelector('h1')?.textContent?.trim() || 'No title';

        const views = document.querySelector('span.view-count')?.textContent || 'No views';
        
        // More flexible likes selector
        const likes = document.querySelector('yt-formatted-string[id="text"]') || 
                      document.querySelector('button#top-level-buttons-computed > yt-formatted-string') || 
                      { textContent: 'No likes' };

        const uploadDate = document.querySelector('#info-strings yt-formatted-string')?.textContent || 'No date';

        // More comprehensive description selection
        const description = document.querySelector('#description-inner yt-formatted-string') || 
                            document.querySelector('#description') || 
                            { textContent: 'No description' };

        return { 
            title: title, 
            views: views, 
            likes: likes.textContent.trim(), 
            uploadDate: uploadDate, 
            description: description.textContent.trim()
        };
    });

    console.log(videoData);

    // Save data to JSON
    fs.writeFileSync('videoData.json', JSON.stringify(videoData, null, 2));

    await browser.close();
}

const videoUrl = 'https://www.youtube.com/watch?v=zRnrq24crDI';
scrapeYouTubeVideo(videoUrl);