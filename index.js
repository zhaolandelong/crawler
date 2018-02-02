const http = require('http');
const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

let i = 1;
const maxPage = 30;
const returnUrl = i => `http://bbs.tianya.cn/post-16-705301-${i}.shtml`;
// let url = 'https://www.baidu.com';

const service = /^http:/.test(returnUrl(i)) ? http : https;

function startRequest(url) {
    console.log(`Start get page ${i} ,url is ${url}`)
    service.get(url, res => {
        let html;

        res.setEncoding('utf-8');
        res.on('data', chunk => {
            html += chunk;
        });
        res.on('end', () => {
            const $ = cheerio.load(html);
            saveTxt($, i);
            i++;
            if (i <= maxPage) {
                startRequest(returnUrl(i))
                // let ms = 2000 + Math.round(Math.random() * 2000);
                // console.log(`After ${ms} ms ,get ${i} page`)
                // setTimeout(() => {
                //     const _url = returnUrl(i);
                //     startRequest(_url);
                // }, ms);
            }
        });
    }).on('error', err => {
        err && console.log(err);
        startRequest(returnUrl(i));
    });
}

function saveTxt($, i) {
    let txt = `Page-${i}:\n`;
    const $atlHeads = $('.atl-head');
    // console.log($atlHeads.find('strong').length)
    $atlHeads.each(function (i) {
        const $me = $(this);
        if ($me.find('strong').text() === '楼主') {
            let _txt = $me.next().find('.bbs-content').text();
            if (_txt.length > 100 && !/回复日期：/.test(_txt)) {
                txt += _txt;
            }
        }
    });
    // let $contents = $('.bbs-content');
    // console.log('test', i, $contents.length);
    const _txt = txt.replace(/\s+/g, '\n');
    fs.appendFile('.data/xiaoshuo.txt', _txt, 'utf-8', err => {
        err && console.log(err);
    });
};

// let s0 = Date.now();
startRequest(returnUrl(i));
// let e0 = Date.now();
// console.log(`Mession finished cost ${e0 - s0} ms!`);