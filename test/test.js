
const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

const domain = 'https://www.javbus.info';
// const urls = ['/series/bdr'];//test url
const urls = ['/search/miad'];

const service = https;

function getList(url) {
    // console.log(`Try to get data in ${url}`);
    service.get(url, res => {
        let html;

        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            const $ = cheerio.load(html),
                $pagi = $('.pagination');
            $('.movie-box').each(function (i) {
                const txt = $(this).text();
                if (txt.indexOf('着衣') !== -1) {
                    console.log(txt.replace(/\s{2,}/g, '\t'))
                }
                // const picUrl = $(this).attr('href');
                // getItem(picUrl);
            });
            //有翻页的情况
            if ($pagi.length) {
                const $act = $pagi.children('.active'),
                    $next = $act.next();
                if ($next.length) {
                    getList(domain + $next.children('a').attr('href'));
                }
            }
        });
    }).on('error', err => {
        err && console.log(err);
    });
}

function getItem(url) {
    service.get(url, res => {
        let html;

        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            const $ = cheerio.load(html);
            saveInfo($, url);
            // savePics($, url);
        });
    }).on('error', err => {
        err && console.log(err);
    });
}

function savePics($, url) {
    const docName = url.replace(domain + '/', ''),
        $pics = $('.bigImage,.sample-box'),
        path = `./data/pic/${docName}`;
    if (!fs.existsSync(path)) {
        console.log(`Saving pics in ${url}`);
        fs.mkdirSync(path);
        $pics.each(function (i) {
            const _url = $(this).attr('href');
            request.head(_url, function (err, res, body) {
                request(_url).pipe(fs.createWriteStream(`${path}/${i}.jpg`));
            });
        })
    }
}

function saveInfo($, url) {
    const title = $('h3').text(),
        $info = $('div.info'),
        $datas = $info.children('p'),
        $actress = $info.children('ul').find('.star-name'),
        links = $('#magnet-table').text();
    const code = $datas.eq(0).text(),
        date = $datas.eq(1).text(),
        duration = $datas.eq(2).text(),
        publisher = $datas.eq(5).text(),
        series = $datas.eq(6).text();
    let actress = '';
    $actress.each(function () {
        actress += $(this).text() + '\t';
    });
    let _txt = `${title}\t${url}\t${code}\t${date}\t${duration}\t${publisher}\t${series}\t演员：${actress}`.replace(/\s{2,}/g, '\t');
    _txt += '\n';
    // console.log(_txt)
    // let _txt = (title + '\t' + url).replace(/\s{2,}/g, '\t') + '\n';
    fs.appendFile('./data/avInfo.txt', _txt, 'utf-8', err => {
        err && console.log(err);
    });
}

urls.forEach(url => {
    getList(domain + url);
});

// getList(domain + urls[1])
// https://mv.rifree.com/index.php