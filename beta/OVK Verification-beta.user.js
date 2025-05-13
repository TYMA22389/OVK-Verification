// ==UserScript==
// @name         OVK Verification
// @namespace    http://tampermonkey.net/
// @version      0.3
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
// Проверяем первый запуск
if (localStorage.getItem('ovkVerificationFirstLoad') === null) {
    // Создаем модальное окно
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `
        <p>У вас тема VKify?</p>
        <button id="yesBtn">Да</button>
        <button id="noBtn">Нет</button>
    `;

    // Стили для диалога
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

    // Обработчики кнопок
    dialog.querySelector('#yesBtn').onclick = () => {
        localStorage.setItem('ovkVerificationFirstLoad', 'false');
        dialog.close();
    };

    dialog.querySelector('#noBtn').onclick = () => {
        localStorage.setItem('ovkVerificationFirstLoad', 'false');
        localStorage.setItem('ovkVerificationForceHeader', 'true');
        dialog.close();
    };

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

    // Если пользователь ответил "Нет" и включено принудительное отображение
    if (localStorage.getItem('ovkVerificationForceHeader') === 'true') {
        const currentPath = window.location.pathname;
        const isVerified = Object.keys(config.verifiedGroups).some(path => currentPath.startsWith(path));

        if (isVerified && !group.querySelector('.name-checkmark')) {
            group.insertAdjacentHTML('beforeend', config.checkmarkHTML);

            const group = document.querySelector('h2');
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
            // Находим элемент с именем автора
            const groupName = groupBlock.querySelector('.post-author-name');
            if (!groupName) return;

            // Проверяем наличие существующей галочки
            if (groupName.parentElement.querySelector('.name-checkmark')) return;

            // Проверяем верификацию
            const groupLink = groupBlock.querySelector('a[href^="/"]');
            const groupPath = new URL(groupLink.href).pathname;

            if (config.verifiedGroups[groupPath]) {
                // Вставляем галочку сразу после имени
                groupName.insertAdjacentHTML('afterend', config.checkmarkHTML);
            }
        });
    }

    function addGroupsListCheckmarks() {
// Основной список групп
    document.querySelectorAll('.ugc-table.group_info').forEach(groupTable => {
        const nameElement = groupTable.querySelector('.data a[href^="/"]'); // Ссылка с названием группы
        if (!nameElement) return;

        // Проверяем существование галочки
        if (nameElement.parentElement.querySelector('.name-checkmark')) return;

        const path = new URL(nameElement.href).pathname;
        if (config.verifiedGroups[path]) {
            nameElement.insertAdjacentHTML('afterend', config.checkmarkHTML);
        }
    });
}
       function addFriendsCheckmarks() {
    document.querySelectorAll('.scroll_node.content').forEach(friendBlock => {
        // Ищем основной блок с именем (вторая колонка)
        const infoColumn = friendBlock.querySelector('td[valign="top"]:nth-child(2)');
        if (!infoColumn) {
            console.error('Колонка с информацией не найдена');
            return;
        }

        // Ищем ссылку с именем пользователя
        const profileLink = infoColumn.querySelector('a[href^="/"]');
        if (!profileLink) {
            console.error('Ссылка на профиль не найдена');
            return;
        }

        // Нормализуем путь (удаляем пробелы)
        const rawHref = profileLink.getAttribute('href').replace(/\s+/g, '');
        const path = new URL(rawHref, window.location.origin).pathname;

        // Проверяем существование галочки
        const existingCheckmark = profileLink.querySelector('.name-checkmark');
        if (existingCheckmark) {
            console.log('Галочка уже существует для:', path);
            return;
        }

        // Добавляем галочку если пользователь верифицирован
        if (config.verifiedUsers[path]) {
            const nameElement = profileLink.querySelector('b');
            if (!nameElement) {
                console.error('Элемент с именем не найден');
                return;
            }

            nameElement.insertAdjacentHTML('afterend', config.checkmarkHTML);
            console.log('✅ Галочка добавлена для:', path);
        }
    });
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