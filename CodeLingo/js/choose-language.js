let selectedLanguage = null;

function selectLang(element, lang) {
    // прибрати попередній вибір
    document.querySelectorAll('.lang-card').forEach(el => {
        el.classList.remove('active');
    });

    // виділити новий
    element.classList.add('active');
    selectedLanguage = lang;
}

function confirmLang() {
    const error = document.getElementById('error');

    if (!selectedLanguage) {
        error.textContent = "❗ Обери мову перед продовженням";
        return;
    }

    // зберігаємо (поки що локально)
    localStorage.setItem("language", selectedLanguage);

    // перехід далі
    window.location.href = "home.html";
}