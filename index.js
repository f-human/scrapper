const chalk = require('chalk');
const puppeteer = require('puppeteer');

(async () => {

    // Chromium browser instance;
    const browser = await puppeteer.launch();

    // very first tab of the browser
    const page = (await browser.pages())[0];

    // stackoverflow will be used to fetch from
    const url = 'https://stackoverflow.com';

    // we will look around for this keyword
    const keyword = 'javascript';

    await logIntro(url, keyword);
    await page.waitFor(1500);

    await logTask(`so, let's go to the page`);
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    });

    // I like to take a break
    await page.waitFor(1500);
    await logStatus('reached Stackoverflow');
    await page.waitFor(1500);

    // find the searchbox
    const searchBox = await page.$('#search input[name="q"]');
    await searchBox.type(keyword);

    // press Enter to initiate search
    await page.keyboard.press('Enter');
    await logTask(`searching for ${keyword}, please wait ....`);
    await page.waitFor(500);
    await page.waitForNavigation({
        waitUntil: 'domcontentloaded'
    });
    await page.waitFor(1000);
    await logStatus('search complete');

    // how many search result?
    let count = await page.$eval('div[data-controller="se-uql"] > div > div', c => c.textContent);
    count = count.replace(/\s+/g, ' ');
    await logStatus(`found ${count}`);
    await page.waitFor(1500);

    // fetch results from first page
    await logTask('will fetch results from first page, only');
    const results = await page.evaluate(() => {
        let res = [];

        // question summary container
        const summaries = document.querySelectorAll('.question-summary');

        for (const summary of summaries) {
            // votes
            let votes = summary.querySelector('.statscontainer .stats .votes .vote-count-post');
            votes = votes.textContent.replace(/\s+/g, ' ');

            // number of answers
            let answers = summary.querySelector('.statscontainer .stats .status strong');
            answers = answers.textContent.replace(/\s+/g, ' ');

            // number of views
            let views = summary.querySelector('.statscontainer .views');
            views = views.textContent.replace(/\s+/g, ' ');

            // title
            let title = summary.querySelector('.summary h3');
            title = title.textContent.replace(/\s+/g, ' ');

            // save it
            res.push({ title, votes, answers, views });
        }

        return res;
    });

    await page.waitFor(1000);
    await logStatus('fetched, showing result:');

    for (const result of results) {
        logResult(result);
    }

    await page.waitFor(2000);
    await logTheEnd();
    await page.waitFor(3000);
    await browser.close();
})();


/*
    colorful console.log
*/
async function logIntro(url, keyword) {
    console.log(chalk.bgYellow(`   *** ***************** INTRO ***************** ***`));
    console.log(chalk.bgGreen(`   *** Scrapper ft. Puppeteer, powered by NodeJS ***`));
    console.log('');
    console.log(chalk.cyan(`     Fetch from: ${url}`));
    console.log(chalk.cyan(`     Keyoword: ${keyword}`));
    console.log('');
    console.log(chalk.bgGreen(`   *** ----------------------------------------- ***`));
    console.log('');
}

async function logTask(msg) {
    console.log('');
    console.log(chalk.blue(`    :> ${msg}`));
}

async function logStatus(msg) {
    console.log(chalk.green(`      - ${msg}`));
}

async function logResult(res) {
    console.log('');
    console.log(`    ${chalk.cyan('Title')}: ${res.title}`);
    console.log(`    ${chalk.cyan('Votes')}: ${res.votes}`);
    console.log(`    ${chalk.cyan('Answers')}: ${res.answers}`);
    console.log(`    ${chalk.cyan('Views')}: ${res.views}`);
    console.log(chalk.cyan('               --------------         '));
}

async function logTheEnd() {
    console.log('');
    console.log('');
    console.log(chalk.bgRed('   *********************** THE END ***********************'));
    console.log(chalk.bgGreen('   *************** Thanks for checking out... ***************'));
    console.log(chalk.bgRed('   ****************** ****************** ******************'));
}
