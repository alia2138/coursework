const API = "https://localhost:7241/api";

window.alert = function(message) {
    Swal.fire({
        text: message,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
};

if (!window.location.pathname.includes("login.html") &&
    !window.location.pathname.includes("register.html")) {

    const user = localStorage.getItem("user");

    if (!user) {
        window.location.href = "login.html";
    }
}

fetch(API + "/user/1")
    .then(r => r.json())
    .then(u => {
        // Оновлюємо вогники, серця та діаманти за їх ID
        const streakEl = document.getElementById("streak");
        const heartsEl = document.getElementById("hearts");
        const diamondsEl = document.getElementById("diamonds");

        if (streakEl) streakEl.textContent = u.streak;
        if (heartsEl) heartsEl.textContent = u.hearts;
        if (diamondsEl) diamondsEl.textContent = u.diamonds;

        // Якщо хочеш оновити ще й прогрес-бар:
        const progressFill = document.getElementById("progressFill");
        const progressText = document.getElementById("progressText");

        if (progressFill && u.progress) {
            progressFill.style.width = u.progress + "%";
            progressText.textContent = `Прогрес: ${u.progress}%`;
        }
    })
    .catch(err => console.error("Помилка завантаження даних:", err));

function goToShop() {
    window.location.href = "shop.html";
}

function goToProfile() {
    window.location.href = "profile.html";
}

function goBack() {
    window.location.href = "home.html";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}