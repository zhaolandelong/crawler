
const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

const domain = 'https://www.javbus.info';
const urls = ['/search/%E5%BD%BC%E5%A5%B3%E3%81%AE%E8%A6%AA%E5%8F%8B', '/label/5xf','/label/ms'];

const service = https;

function getList(url) {
    console.log(`Try to get data in ${url}`);
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
                const picUrl = $(this).attr('href');
                getPics(picUrl);
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

function getPics(url) {
    service.get(url, res => {
        let html;

        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            const $ = cheerio.load(html);
            savePics($, url);
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

urls.forEach(url => {
    getList(domain + url);
});

// getList(domain + urls[1])
// https://mv.rifree.com/index.php