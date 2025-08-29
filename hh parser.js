// ==UserScript==
// @name         HH.ru Parser
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Сбор данных с резюме
// @match        *://hh.ru/resume/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    const APP_SCRIPT_URL = "ССЫЛКА НА РАЗВЕРНУТЫЙ В APPS SCIPT ВЕБ АПП";
    const BUTTON_COLOR = "#2196F3";

    // Парсим данные с новыми селекторами
    const parseResumeData = () => {
        return {
            name: document.querySelector('[data-qa="resume-personal-name"]')?.textContent.trim() || "",
            phone: document.querySelector('[data-qa="resume-contact-phone"]')?.textContent.trim() || "",
            age: document.querySelector('[data-qa="resume-personal-age"]')?.textContent.replace(/\D/g, '') || "",
            city: document.querySelector('[data-qa="resume-personal-address"]')?.textContent.trim() || "",
            metro: document.querySelector('[data-qa="resume-personal-metro"]')?.textContent.trim() || "",
            resumeTitle: document.querySelector('[data-qa="resume-position"]')?.textContent.trim() || "",
            url: window.location.href.split('?')[0]
        };
    };

    // Создаем кнопку
    const btn = document.createElement('button');
    btn.innerHTML = '📤 Сохранить в таблицу';
    btn.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 10px 15px;
        background: ${BUTTON_COLOR};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: Arial;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(btn);

    // Отправка данных
    btn.addEventListener('click', () => {
        const data = parseResumeData();

        GM_xmlhttpRequest({
            method: "POST",
            url: APP_SCRIPT_URL,
            data: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
            onload: function(response) {
                const message = response.status === 200 ?
                    (response.responseText.includes("Дубликат") ?
                        "⚠️ Кандидат уже в таблице" :
                        "✅ Данные добавлены") :
                    "Ошибка: " + response.responseText;

                GM_notification({
                    title: response.status === 200 ? "Готово" : "Ошибка",
                    text: message,
                    timeout: 3000
                });
            }
        });
    });
})();