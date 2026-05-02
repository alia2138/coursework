
let user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
    alert("Користувач не знайдений");
    window.location.href = "login.html";
}

// ---------------- UI ----------------
function updateUI() {
    document.getElementById("streak").innerText = user.streak || 0;
    document.getElementById("hearts").innerText = user.hearts || 0;
    document.getElementById("diamonds").innerText = user.diamonds || 0;
}

// ---------------- HEARTS ----------------
const MAX_HEARTS = 5;
const REGEN_TIME = 5 * 60 * 1000; // 5 хв

let lastUpdate = null;

// 🔥 завантаження з БД
function loadHearts() {
    fetch(API + "/heart/" + user.id)
        .then(r => r.json())
        .then(data => {

            user.hearts = data.hearts ?? 0;
            lastUpdate = data.lastUpdate
                ? new Date(data.lastUpdate)
                : new Date();

            localStorage.setItem("user", JSON.stringify(user));

            updateHeartsUI();
        })
        .catch(err => {
            console.error("heart load error", err);
        });
}

// 🔥 UI
function updateHeartsUI() {
    const el = document.getElementById("hearts");
    if (el) el.innerText = user.hearts;
}

// 🔥 ТАЙМЕР
function startHeartTimer() {

    setInterval(() => {

        const timerEl = document.getElementById("heartTimer");
        if (!timerEl || !lastUpdate) return;

        // якщо максимум
        if (user.hearts >= MAX_HEARTS) {
            timerEl.innerText = "max";
            return;
        }

        const now = new Date();
        const diff = now - lastUpdate;

        // 🔥 якщо час пройшов → додаємо серце через API
        if (diff >= REGEN_TIME) {

            fetch(API + "/heart/add/" + user.id, {
                method: "POST"
            })
                .then(r => r.json())
                .then(data => {

                    user.hearts = data.hearts;
                    lastUpdate = new Date(data.lastUpdate);

                    localStorage.setItem("user", JSON.stringify(user));
                    updateHeartsUI();
                });

            return;
        }

        // 🔥 показ таймера
        const remaining = REGEN_TIME - diff;

        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);

        timerEl.innerText =
            `${min}:${sec.toString().padStart(2, '0')}`;

    }, 1000);
}

function openLesson(lessonId) {

    // ❗ ЖОРСТКА перевірка
    if (user.hearts <= 0) {
        Swal.fire({
            icon: "error",
            title: "Немає життів 💔",
            text: "Зачекай відновлення"
        });
        return;
    }

    fetch(API + "/heart/can-start/" + user.id)
        .then(r => r.json())
        .then(res => {

            if (!res.canStart) {
                Swal.fire({
                    icon: "error",
                    title: "Немає життів 💔"
                });
                return;
            }

            localStorage.setItem("lessonId", lessonId);
            window.location.href = "lesson.html";
        });
}

// ---------------- COURSES ----------------
const lessonsContainer = document.getElementById("levelsContainer");

let selectedCourseId = null;

function loadCourses() {
    Promise.all([
        fetch(API + "/course").then(r => r.json()),
        fetch(API + "/usercourse/" + user.id).then(r => r.json())
    ])
        .then(([allCourses, userCourses]) => {

            const menu = document.getElementById("courseMenu");
            menu.innerHTML = "";

            const ownedIds = userCourses.map(x => x.courseId ?? x.id ?? x);

            // СОРТУВАННЯ
            allCourses.sort((a, b) => {
                const aOwned = ownedIds.some(id => Number(id) === Number(a.id));
                const bOwned = ownedIds.some(id => Number(id) === Number(b.id));
                return bOwned - aOwned;
            });

            // ВИПРАВЛЕНО: Тільки один цикл для малювання
            allCourses.forEach(course => {

                const isOwned = ownedIds.some(id => Number(id) === Number(course.id));

                const div = document.createElement("div");
                div.className = "menu-item " + (isOwned ? "" : "locked");
                div.innerText = course.name;

                div.onclick = () => {
                    if (!isOwned) {
                        Swal.fire({
                            icon: "info",
                            title: "Курс закритий",
                            text: "Спочатку купи його 💎"
                        });
                        return;
                    }

                    document.querySelectorAll(".menu-item")
                        .forEach(el => el.classList.remove("selected"));

                    div.classList.add("selected");

                    loadLessons(course.id);
                };

                menu.appendChild(div);
            });
        });
}

// ---------------- LESSONS ----------------
function loadLessons(courseId) {

    fetch(API + "/progress/with-progress/" + courseId + "/" + user.id)
        .then(r => r.json())
        .then(data => {

            lessonsContainer.innerHTML = "";

            data.forEach((l, i) => {

                const div = document.createElement("div");

                div.className = l.unlocked ? "level-card" : "level-card locked";

                div.innerHTML = `
                    <div>
                        <div>Рівень ${i + 1}</div>
                        <div>${l.unlocked ? l.title : "🔒 " + l.title}</div>
                    </div>
                `;

                if (l.unlocked) {
                    div.onclick = () => openLesson(l.id);
                }

                lessonsContainer.appendChild(div);
            });

        });
}

function loadGlobalProgress() {
    fetch(API + "/progress/full/" + user.id)
        .then(r => r.json())
        .then(data => {

            let totalLessons = 0;
            let doneLessons = 0;

            data.forEach(c => {
                totalLessons += c.lessonsTotal;
                doneLessons += c.lessonsDone;
            });

            const percent = totalLessons > 0
                ? Math.round((doneLessons / totalLessons) * 100)
                : 0;

            const fill = document.getElementById("progressFill");
            const text = document.getElementById("progressText");

            if (fill && text) {
                fill.style.width = percent + "%";
                text.innerText = `Прогрес: ${percent}%`;
            }
        });
}


// ---------------- INIT ----------------
setTimeout(() => {
    startHeartTimer();
}, 500);
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    loadHearts();
    loadCourses();
    loadGlobalProgress();
    setTimeout(startHeartTimer, 500);
});
