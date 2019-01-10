////////// INIT  //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {buildErrors} from "./shared.js";

//######## CONTENT SECTIONS ########//

let passwordForgotForm = $("#password-forgot-form");

let errorsSection = $("#errors-sect");

//######## UI COMPONENTS ########//

let emailField = $("#email");

let optionsButton = $("#options-btn");
let backButton = $("#back-btn");
let passwordForgotButton = $("#password-forgot-btn");
let errorButton = $(".error-btn");

let alert = $(".alert");

let backIcon = $("#back-icon");
let checkIcon = $("#check-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();
reloadIcons.hide();

////////// PASSWORD //////////

//######## FORGOT HANDLING ########//

let validationInstance = passwordForgotForm.parsley();

passwordForgotForm.submit(event => event.preventDefault());

passwordForgotButton.on("click", () => {
    if (validationInstance.isValid()) {
        passwordForgotButton.find(checkIcon).toggle();
        passwordForgotButton.find(reloadIcons).toggle();
        let data = {
            email: emailField.val(),
        };
        let successCallback = (data, status, jqXHR) => {
            passwordForgotButton.find(reloadIcons).toggle();
            deleteToken().then(() => chrome.storage.sync.set({message: data["message"]}, () => window.location.href = "login.html"));
        };
        let errorCallback = (jqXHR, status) => {
            passwordForgotButton.find(checkIcon).toggle();
            passwordForgotButton.find(reloadIcons).toggle();
            if (jqXHR.responseText == null) {
                passwordForgotButton.hide();
                let button = passwordForgotButton.parent().find(errorButton);
                button.show();
                button.prop("disabled", true)
            } else {
                let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                    errorsSection.find(alert).empty();
                    errorsSection.find(alert).append(result);
                    errorsSection.show();
                });
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        ajax("POST", "password/forgot.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
    }
});

////////// GENERAL //////////

//######### OPTIONS HANDLING #########//

optionsButton.on("click", () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage(); else window.open(chrome.runtime.getURL('options.html'));
});

//########## GO BACK HANDLING #########//

backButton.on("click", () => {
    backButton.find(reloadIcons).toggle();
    backButton.find(backIcon).toggle();
    window.location.href = "login.html";
});