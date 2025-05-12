// ==UserScript==
// @name         OVK Verification
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Теперь администрация ОВК получает люлей! Галочка - для всех элит и инфоисточников!
// @author       TYMA223
// @match        https://ovk.to/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        verifiedUsers: {
            '/pelmewkin': true,
            '/id281': true,
            '/ystrica': true
        },
        checkmarkHTML: `
            <img class="name-checkmark"
                 src="/assets/packages/static/openvk/img/checkmark.png"
                 style="display:inline-block; width:18px; height:18px; margin-left:4px; vertical-align:middle;">
        `
    };

    function addCheckmarks() {
        addHeaderCheckmark();
        addPostAuthorsCheckmarks();
    }

    function addHeaderCheckmark() {
        const header = document.querySelector('.page_yellowheader');
        if (!header) return;

        const currentPath = window.location.pathname;
        const isVerified = Object.keys(config.verifiedUsers).some(path => currentPath.startsWith(path));

        if (isVerified && !header.querySelector('.name-checkmark')) {
            header.insertAdjacentHTML('beforeend', config.checkmarkHTML);
        }
    }

    function addPostAuthorsCheckmarks() {
        document.querySelectorAll('.post-author').forEach(authorBlock => {
            // Находим элемент с именем автора
            const authorName = authorBlock.querySelector('.post-author-name');
            if (!authorName) return;

            // Проверяем наличие существующей галочки
            if (authorName.parentElement.querySelector('.name-checkmark')) return;

            // Проверяем верификацию
            const authorLink = authorBlock.querySelector('a[href^="/"]');
            const userPath = new URL(authorLink.href).pathname;

            if (config.verifiedUsers[userPath]) {
                // Вставляем галочку сразу после имени
                authorName.insertAdjacentHTML('afterend', config.checkmarkHTML);
            }
        });
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) addCheckmarks();
        });
    });

    window.addEventListener('load', () => {
        addCheckmarks();
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();