////////// INIT  //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {emptyAjax} from "./shared.js";

let body = $("body");

//######## CONTENT SECTIONS ########//

let buttonsSections = $("#buttons-sect");
let loadingSection = $("#loading-sect");
let loginSection = $("#login-sect");
let undetectedPublicationSection = $("#undetected-publication-sect");
let ratingSection = $("#rating-sect");
let publicationScoreSection = $("#publication-score-sect");
let userScoreSection = $("#user-score-sect");

//######## MODALS ########//

let modalProfile = $("#modal-profile");
let modalConfigure = $("#modal-configuration");
let modalRefresh = $("#modal-refresh");

//######## UI COMPONENTS ########//

let optionsButton = $("#options-btn");
let logoutButton = $("#logout-btn");
let profileButton = $("#profile-btn");
let loadRateButton = $("#load-rate-btn");
let voteButton = $("#vote-btn");
let voteSuccessButton = $("#vote-success-btn");
let configureButton = $("#configure-btn");
let configureSaveButton = $("#configuration-save-btn");
let loadSaveButton = $("#load-save-btn");
let saveButton = $("#save-btn");
let downloadButton = $("#download-btn");
let refreshButton = $("#refresh-btn");
let errorButtons = $(".error-btn");
let passwordEditButton = $("#password-edit-btn");
let modalRefreshButton = $("#modal-refresh-btn");

let ratingCaption = $("#rating-caption");
let ratingSubCaption = $("#rating-subcaption");
let ratingSlider = $("#rating-slider");
let ratingText = $("#rating-text");
let buttonsCaption = $("#buttons-caption");
let undetectedPublicationSubcaption = $("#undetected-publication-subcaption");

let firstNameValue = $("#first-name-val");
let lastNameValue = $("#last-name-val");
let emailValue = $("#email-val");
let orcidValue = $("#orcid-val");
let subscribeValue = $("#subscribe-val");
let userScoreRSMValue = $("#user-score-rsm-val");
let userScoreTRMValue = $("#user-score-trm-val");

let publicationScoreRSMValue = $("#publication-score-rsm-val");
let publicationScoreTRMValue = $("#publication-score-trm-val");

let anonymizeCheckbox = $("#anonymize-check");

let signOutIcon = $("#sign-out-icon");
let profileIcon = $("#profile-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

ratingSection.hide();
undetectedPublicationSection.hide();
publicationScoreSection.hide();
downloadButton.hide();
refreshButton.hide();
saveButton.hide();
loadRateButton.show();
loadSaveButton.show();
voteButton.hide();
configureButton.hide();
voteSuccessButton.hide();
errorButtons.hide();
reloadIcons.hide();
ratingCaption.hide();
ratingSubCaption.hide();
ratingSlider.hide();
ratingText.show();

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        buttonsSections.show();
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            let currentUrl = tabs[0].url;
            let data = {
                publication: {
                    pdf_url: currentUrl
                }
            };
            let successCallback = (data, status, jqXHR) => {
                ratingSection.show();
                publicationScoreSection.show();
                undetectedPublicationSection.hide();
                loadingSection.hide();
                ratingSlider.slider({});
                ratingSlider.on("slide", slideEvt => ratingText.text(slideEvt.value));
                ////////// PUBLICATION //////////

                //######### STATUS HANDLING (EXISTS ON THE DB, RATED BY THE LOGGED IN USER, SAVED FOR LATER...) #########//
                chrome.storage.sync.get(['authToken'], result => {
                    let authToken = result.authToken;
                    if (authToken != null) {
                        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                            let currentUrl = tabs[0].url;
                            let data = {
                                publication: {
                                    pdf_url: currentUrl
                                }
                            };
                            // 1.2 Publication exists, so it may be rated by the user
                            let successCallback = (data, status, jqXHR) => {
                                publicationScoreRSMValue.text((data["score_rsm"] * 100).toFixed(2));
                                publicationScoreTRMValue.text((data["score_trm"] * 100).toFixed(2));
                                // 2.2 Publication has been rated by the user, so it is not necessary to check if it has been annotated
                                let secondSuccessCallback = (data, status, jqXHR) => {
                                    buttonsCaption.hide();
                                    loadRateButton.hide();
                                    loadSaveButton.hide();
                                    voteButton.hide();
                                    configureButton.hide();
                                    downloadButton.hide();
                                    refreshButton.hide();
                                    saveButton.hide();
                                    voteSuccessButton.show();
                                    voteSuccessButton.prop("disabled", true);
                                    ratingCaption.hide();
                                    ratingSubCaption.show();
                                    ratingSlider.slider('destroy');
                                    ratingSlider.hide();
                                    ratingText.removeClass("mt-3");
                                    ratingText.text(data["score"]);
                                };
                                // 2.3 Publication has not been rated by the user
                                let secondErrorCallback = (jqXHR, status) => {
                                    loadRateButton.hide();
                                    voteSuccessButton.hide();
                                    ratingSubCaption.hide();
                                    buttonsCaption.show();
                                    ratingCaption.show();
                                    ratingSlider.slider({});
                                    ratingText.text("50");
                                    ratingText.prop("class", "mt-3");
                                    voteButton.show();
                                    configureButton.show();
                                    // 3.1 The rated publication was also annotated
                                    let thirdSuccessCallback = (data, status, jqXHR) => {
                                        loadSaveButton.hide();
                                        saveButton.hide();
                                        downloadButton.show();
                                        downloadButton.attr("href", data["pdf_download_url_link"]);
                                        refreshButton.show();
                                    };
                                    // 3.2 The rated publication was not annotated
                                    let thirdErrorCallback = (jqXHR, status) => {
                                        loadSaveButton.hide();
                                        downloadButton.hide();
                                        refreshButton.hide();
                                        saveButton.show();
                                    };
                                    // 3.1 Does the rated publication has been already annotated?
                                    let thirdPromise = emptyAjax("GET", `publications/${data["id"]}/is_saved_for_later.json`, "application/json; charset=utf-8", "json", true, thirdSuccessCallback, thirdErrorCallback);
                                };
                                // 2.1 Does the publication has been rated by the logged user?
                                let secondPromise = emptyAjax("GET", `publications/${data["id"]}/is_rated.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
                            };
                            // 1.3 Publication was never rated, so it does not exists on the database
                            let errorCallback = (jqXHR, status) => {
                                loadRateButton.hide();
                                loadSaveButton.hide();
                                voteSuccessButton.hide();
                                saveButton.show();
                                configureButton.show();
                                voteButton.show();
                                ratingCaption.show();
                                ratingSubCaption.hide();
                                ratingSlider.slider({});
                                ratingText.text("50");
                                ratingText.prop("class", "mt-3");
                                publicationScoreRSMValue.text("...");
                                publicationScoreTRMValue.text("...");
                            };
                            // 1.1 Does the publication exists on the database?
                            let promise = ajax("POST", "publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
                        });
                    }
                })
            };
            let errorCallback = (jqXHR, status) => {
                ratingSection.hide();
                publicationScoreSection.hide();
                undetectedPublicationSection.show();
                loadingSection.hide()
            };
            let promise = ajax("POST", "publications/is_fetchable.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
        });
    } else {
        buttonsSections.show();
        logoutButton.hide();
        profileButton.hide();
        ratingSection.hide();
        publicationScoreSection.hide();
        undetectedPublicationSection.hide();
        loadingSection.hide()
    }
});

//######### SAVE FOR LATER HANDLING #########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        saveButton.on("click", () => {
            chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                let data = {
                    publication: {
                        pdf_url: tabs[0].url
                    }
                };
                saveButton.find(reloadIcons).toggle();
                // 1.2 Publication fetched, hide save for later button and show the download one
                let successCallback = (data, status, jqXHR) => {
                    saveButton.find(reloadIcons).toggle();
                    saveButton.hide();
                    downloadButton.show();
                    downloadButton.attr("href", data["pdf_download_url_link"]);
                    refreshButton.show();
                };
                // 1.3 Error during publication fetching, hide save for later and download buttons
                let errorCallback = (jqXHR, status) => {
                    saveButton.find(reloadIcons).toggle();
                    saveButton.hide();
                    let errorButton = saveButton.parent().find(errorButtons);
                    errorButton.show();
                    errorButton.prop("disabled", true)
                };
                // 1.1 Fetch and annotate the publication
                let promise = ajax("POST", "publications/fetch.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
            });
        });
    }
});

///######### REFRESH HANDLING #########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        refreshButton.on("click", () => {
            modalRefresh.modal("show");
        });
    }
});

modalRefreshButton.on("click", () => {
    chrome.storage.sync.get(['authToken'], result => {
        let authToken = result.authToken;
        if (authToken != null) {
            modalRefresh.modal("hide");
            downloadButton.hide();
            refreshButton.hide();
            loadSaveButton.show();
            chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                let data = {
                    publication: {
                        pdf_url: tabs[0].url
                    }
                };
                // 1.2 Publication exists, so it is safe to refresh it
                let successCallback = (data, status, jqXHR) => {
                    // 2.2 Publication refreshed, so it it safe to show the download button
                    let secondSuccessCallback = (data, status, jqXHR) => {
                        loadSaveButton.hide();
                        downloadButton.show();
                        downloadButton.attr("href", data["pdf_download_url_link"]);
                        refreshButton.show();
                    };
                    // 2.3 Error during publication refresh, it is not safe to show the download button
                    let secondErrorCallback = (jqXHR, status) => {
                        loadSaveButton.hide();
                        let errorButton = downloadButton.parent().find(errorButtons);
                        errorButton.show();
                        errorButton.prop("disabled", true)
                    };
                    // 2.1 Refresh the publication
                    let secondPromise = emptyAjax("GET", `publications/${data["id"]}/refresh.json`, "application/json; charset=utf-8", "json", true, secondSuccessCallback, secondErrorCallback);
                };
                // 1.3 Publication was never rated, so it does not exists on the database
                let errorCallback = function (jqXHR, status) {
                    loadSaveButton.hide();
                    let errorButton = downloadButton.parent().find(errorButtons);
                    errorButton.show();
                    errorButton.prop("disabled", true)
                };
                // 1.1 Does the publication exists on the database?
                let promise = ajax("POST", "publications/lookup.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
            });
        }
    });
});

////////// RATING //////////

//#######  ACTION HANDLING #########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        voteButton.on("click", () => {
            chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                voteButton.find(reloadIcons).toggle();
                let score = ratingSlider.val();
                let data = {
                    rating: {
                        score: score,
                        pdf_url: tabs[0].url,
                        anonymous: anonymizeCheckbox.is(':checked')
                    }
                };
                // 1.2 Rating created successfully
                let successCallback = (data, status, jqXHR) => {
                    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
                        let secondData = {
                            publication: {
                                pdf_url: tabs[0].url
                            }
                        };
                        let secondSuccessCallback = (data, status, jqXHR) => {
                            voteButton.find(reloadIcons).toggle();
                            voteButton.hide();
                            configureButton.hide();
                            buttonsCaption.hide();
                            downloadButton.hide();
                            saveButton.hide();
                            refreshButton.hide();
                            ratingCaption.hide();
                            ratingSlider.slider('destroy');
                            ratingSlider.hide();
                            ratingText.removeClass("mt-3");
                            ratingSubCaption.show();
                            voteSuccessButton.show();
                            voteSuccessButton.prop("disabled", true);
                            publicationScoreRSMValue.text((data["score_rsm"] * 100).toFixed(2));
                            publicationScoreTRMValue.text((data["score_trm"] * 100).toFixed(2));
                        };
                        let secondErrorCallback = (jqXHR, status) => {
                            voteButton.find(reloadIcons).toggle();
                            voteButton.hide();
                            configureButton.hide();
                            voteSuccessButton.show();
                            voteSuccessButton.prop("disabled", true);
                            publicationScoreRSMValue.text("...");
                            publicationScoreTRMValue.text("...");
                        };
                        let secondPromise = ajax("POST", "publications/lookup.json", "application/json; charset=utf-8", "json", true, secondData, secondSuccessCallback, secondErrorCallback);
                    });
                    let thirdSuccessCallback = (data, status, jqXHR) => {
                        userScoreRSMValue.text((data["score"] * 100).toFixed(2));
                        userScoreTRMValue.text((data["bonus"] * 100).toFixed(2));
                    };
                    let thirdErrorCallback = (jqXHR, status) => {
                        userScoreRSMValue.text("...");
                        userScoreTRMValue.text("...");
                    };
                    let promise = emptyAjax("POST", "users/info.json", "application/json; charset=utf-8", "json", true, thirdSuccessCallback, thirdErrorCallback);
                };
                // 1.3 Error during rating creation
                let errorCallback = (jqXHR, status) => {
                    voteButton.hide();
                    configureButton.hide();
                    let errorButton = voteButton.parent().find(errorButtons);
                    errorButton.show();
                    errorButton.prop("disabled", true)
                };
                // 1.1 Create a new rating with the selected score
                let promise = ajax("POST", "ratings.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
            });
        });
    }
});

//######### CONFIGURATION HANDLING #########//

configureSaveButton.on("click", () => modalConfigure.modal("hide"));

////////// USER  //////////

//####### STATUS HANDLING (SCORES, ...) #########//

chrome.storage.sync.get(['authToken'], result => {
    let authToken = result.authToken;
    if (authToken != null) {
        let successCallback = (data, status, jqXHR) => {
            firstNameValue.text(data["first_name"]);
            lastNameValue.text(data["last_name"]);
            emailValue.text(data["email"]);
            orcidValue.text(data["orcid"]);
            (data["subscribe"]) ? subscribeValue.text("Yes") : subscribeValue.text("No");
            userScoreRSMValue.text((data["score"] * 100).toFixed(2));
            userScoreTRMValue.text((data["bonus"] * 100).toFixed(2));
        };
        let errorCallback = (jqXHR, status) => {
            firstNameValue.text("...");
            lastNameValue.text("...");
            emailValue.text("...");
            orcidValue.text("...");
            subscribeValue.text("...");
            userScoreRSMValue.text("...");
            userScoreTRMValue.text("...");
        };
        let promise = emptyAjax("POST", "users/info.json", "application/json; charset=utf-8", "json", true, successCallback, errorCallback);
    }
});

//####### LOGOUT HANDLING #########//

logoutButton.on("click", () => {
    logoutButton.find(reloadIcons).toggle();
    logoutButton.find(signOutIcon).toggle();
    deleteToken().then(() => window.location.href = "login.html");
});

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});