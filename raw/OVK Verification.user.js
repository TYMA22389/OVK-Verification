// ==UserScript==
// @name         OVK Verification
// @namespace    http://tampermonkey.net/
// @version      0.?
// @description  Теперь администрация ОВК получает люлей! Галочка - для всех элит и инфоисточников!
// @author       TYMA223
// @match        https://ovk.to/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const config = {
        verifiedUsers: {
            '/tyma223': true,
            '/id281': true,
            '/pelmewkin': true,
            '/zevs': true,
            '/shiva': true,
            '/id21151': true,
            '/dranik': true,
            '/sobka': true,
            '/sysop': true,
            '/thedanilcaps': true
        },
        verifiedGroups: {
            '/club5394': true,
            '/sourcememes': true
        },
        checkmarkHTML: `
            <img class="name-checkmark"
                 src="/assets/packages/static/openvk/img/checkmark.png">
        `
    };

    // Основные функции
    function addCheckmarks() {
        addHeaderCheckmark();
        addPostAuthorsCheckmarks();
        addGroupCheckmark();
        addPostGroupCheckmarks();
        addGroupsListCheckmarks();
        addFriendsCheckmarks();
    }

    function addGroupCheckmark() {
        const group = document.querySelector('.page_yellowheader');
        if (!group) return;

        const currentPath = window.location.pathname;
        const isVerified = Object.keys(config.verifiedGroups).some(path => currentPath.startsWith(path));

        if (isVerified && !group.querySelector('.name-checkmark')) {
            group.insertAdjacentHTML('beforeend', config.checkmarkHTML);
        }
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

    function addPostGroupCheckmarks() {
        document.querySelectorAll('.post-author').forEach(groupBlock => {
            const groupName = groupBlock.querySelector('.post-author-name');
            if (!groupName) return;

            if (groupName.parentElement.querySelector('.name-checkmark')) return;

            const groupLink = groupBlock.querySelector('a[href^="/"]');
            if (!groupLink) return;

            const groupPath = new URL(groupLink.href).pathname;
            if (config.verifiedGroups[groupPath]) {
                groupName.insertAdjacentHTML('afterend', config.checkmarkHTML);
            }
        });
    }

    function addGroupsListCheckmarks() {
        document.querySelectorAll('.ugc-table.group_info').forEach(groupTable => {
            const nameElement = groupTable.querySelector('.data a[href^="/"]');
            if (!nameElement) return;

            if (nameElement.parentElement.querySelector('.name-checkmark')) return;

            const path = new URL(nameElement.href).pathname;
            if (config.verifiedGroups[path]) {
                nameElement.insertAdjacentHTML('afterend', config.checkmarkHTML);
            }
        });
    }

    function addFriendsCheckmarks() {
        document.querySelectorAll('.scroll_node.content').forEach(friendBlock => {
            const infoColumn = friendBlock.querySelector('td[valign="top"]:nth-child(2)');
            if (!infoColumn) return;

            const profileLink = infoColumn.querySelector('a[href^="/"]');
            if (!profileLink) return;

            const rawHref = profileLink.getAttribute('href').replace(/\s+/g, '');
            const path = new URL(rawHref, window.location.origin).pathname;

            if (profileLink.querySelector('.name-checkmark')) return;

            if (config.verifiedUsers[path]) {
                const nameElement = profileLink.querySelector('b');
                if (!nameElement) return;

                nameElement.insertAdjacentHTML('afterend', config.checkmarkHTML);
            }
        });
    }

    function addPostAuthorsCheckmarks() {
        document.querySelectorAll('.post-author').forEach(authorBlock => {
            const authorName = authorBlock.querySelector('.post-author-name');
            if (!authorName) return;

            if (authorName.parentElement.querySelector('.name-checkmark')) return;

            const authorLink = authorBlock.querySelector('a[href^="/"]');
            if (!authorLink) return;

            const userPath = new URL(authorLink.href).pathname;
            if (config.verifiedUsers[userPath]) {
                authorName.insertAdjacentHTML('afterend', config.checkmarkHTML);
            }
        });
    }

    // Инициализация
    function init() {
        if (localStorage.getItem('ovkVerificationFirstLoad') === null) {
            const dialog = document.createElement('dialog');
            dialog.innerHTML = `
                <p>У вас тема VKify?</p>
                <button id="yesBtn">Да</button>
                <button id="noBtn">Нет</button>
            `;

            GM_addStyle(`
                dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 20px;
                    border: 1px solid #ccc;
                    z-index: 99999;
                    background: white;
                }
                button { margin: 0 10px; }
            `);

            document.body.appendChild(dialog);
            dialog.showModal();

            dialog.querySelector('#yesBtn').onclick = () => {
                localStorage.setItem('ovkVerificationFirstLoad', 'false');
                dialog.close();
            };

            dialog.querySelector('#noBtn').onclick = () => {
                localStorage.setItem('ovkVerificationFirstLoad', 'false');
                localStorage.setItem('ovkVerificationForceHeader', 'true');
                dialog.close();
            };
        }

        const observer = new MutationObserver(() => addCheckmarks());
        window.addEventListener('load', () => {
            addCheckmarks();
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    init();
})();