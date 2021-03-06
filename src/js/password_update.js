////////// INIT  //////////

//######## IMPORTS ########//

import {deleteToken} from "./shared.js";
import {ajax} from "./shared.js";
import {buildErrors} from "./shared.js";
import {removePreloader} from "./shared.js";

//######## SECTIONS ########//

let passwordEditForm = $("#password-edit-form");

let errorsSection = $(".errors-sect");

//######## UI COMPONENTS ########//

let currentPasswordField = $("#current-password");
let newPasswordField = $("#new-password");
let newPasswordConfirmationField = $("#new-password-confirmation");

let optionsButton = $("#options-btn");
let backButton = $("#back-btn");
let passwordEditButton = $("#password-edit-btn");
let errorButton = $(".error-btn");

let alert = $(".alert");

let backIcon = $("#back-icon");
let checkIcon = $("#check-icon");
let reloadIcons = $(".reload-icon");

//######## UI INITIAL SETUP ########//

errorsSection.hide();
errorButton.hide();
reloadIcons.hide();

removePreloader();

////////// PASSWORD //////////

//######## UPDATE HANDLING ########//

passwordEditForm.submit(event => event.preventDefault());

passwordEditButton.on("click", () => {
    let validationInstance = passwordEditForm.parsley();
    if (validationInstance.isValid()) {
        passwordEditButton.find(checkIcon).toggle();
        passwordEditButton.find(reloadIcons).toggle();
        let data = {
            current_password: currentPasswordField.val(),
            new_password: newPasswordField.val(),
            new_password_confirmation: newPasswordConfirmationField.val()
        };
        let successCallback = (data, status, jqXHR) => {
            passwordEditButton.find(reloadIcons).toggle();
            deleteToken();
            chrome.storage.sync.set({message: data["message"]}, () => window.location.href = "login.html");
        };
        let errorCallback = (jqXHR, status) => {
            passwordEditButton.find(checkIcon).toggle();
            passwordEditButton.find(reloadIcons).toggle();
            if (jqXHR.responseText == null) {
                passwordEditButton.hide();
                let button = passwordEditButton.parent().find(errorButton);
                button.show();
                button.prop("disabled", true)
            } else {
                let errorPromise = buildErrors(jqXHR.responseText).then(result => {
                    passwordEditButton.parent().find(errorsSection).find(alert).empty();
                    passwordEditButton.parent().find(errorsSection).find(alert).append(result);
                    passwordEditButton.parent().find(errorsSection).show();
                });
            }
        };
        // noinspection JSIgnoredPromiseFromCall
        ajax("POST", "password/update.json", "application/json; charset=utf-8", "json", true, data, successCallback, errorCallback);
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
    window.history.back()
});