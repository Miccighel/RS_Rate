//######### DEFAULT STARTUP VALUES #########//

chrome.runtime.onInstalled.addListener(function () {
    let defaultValue = "http://localhost:3000/";
    chrome.storage.sync.set({host: defaultValue}, function () {
        console.log("Default value for option \"Host\" set.");
        chrome.storage.sync.get(['host'], function (result) {
            console.log(`Value for option "Host" is ${result.host}`)
        });
    });
});

//######### PAGE STATE MATCHING #########//


let arxivRule = {
    conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
            hostEquals: 'arxiv.org',
            schemes: ['https'],
            urlContains: 'pdf'
        },
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};
let springerLinkRule = {
    conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
            hostEquals: 'link.springer.com',
            schemes: ['https'],
            urlContains: 'pdf'
        },
    })],
    actions: [new chrome.declarativeContent.ShowPageAction()]
};

chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([springerLinkRule]);
        chrome.declarativeContent.onPageChanged.addRules([arxivRule]);
    });
});