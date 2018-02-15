
const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

let i = 1;
const maxPage = 244;
const domain = 'https://www.javbus.info/';
const baseUrl = `${domain}search/%E5%BD%BC%E5%A5%B3%E3%81%AE%E8%A6%AA%E5%8F%8B`;

const service = https;

function getList(url) {
    service.get(url, res => {
        let html;

        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            const $ = cheerio.load(html);
            $('.movie-box').each(function (i) {
                const picUrl = $(this).attr('href');
                getPics(picUrl);
            })
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
    const docName = url.replace(domain, ''),
        bigImgUrl = $('.bigImage').attr('href'),
        $pics = $('.sample-box'),
        path = `./data/pic/${docName}`;
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
        request.head(bigImgUrl, function (err, res, body) {
            request(bigImgUrl).pipe(fs.createWriteStream(`${path}/bigImg.jpg`));
        });
        $pics.each(function (i) {
            const _url = $(this).attr('href');
            request.head(_url, function (err, res, body) {
                request(_url).pipe(fs.createWriteStream(`${path}/${i + 1}.jpg`));
            });
        })
    }
}
getList(baseUrl);