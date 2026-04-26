const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
    alert("Користувач не знайдений");
    window.location.href = "login.html";
}

// 🔥 статистика
document.getElementById("streak").innerText = user.streak || 0;
document.getElementById("hearts").innerText = user.hearts || 0;
document.getElementById("diamonds").innerText = user.diamonds || 0;

// 🔥 контейнер уроків
const lessonsContainer = document.getElementById("levelsContainer");

loadCourses();

// ---------------- COURSES ----------------
function loadCourses() {
    Promise.all([
        fetch(API + "/course").then(r => r.json()),
        fetch(API + "/usercourse/" + user.id).then(r => r.json())
    ])
        .then(([allCourses, userCourses]) => {
            const menu = document.getElementById("courseMenu");
            menu.innerHTML = "";

            if (!allCourses.length) {
                menu.innerHTML = "<p>Немає курсів</p>";
                return;
            }

            // 1. Сортування: спочатку відкриті (owned), потім закриті
            allCourses.sort((a, b) => {
                const aOwned = userCourses.includes(a.id);
                const bOwned = userCourses.includes(b.id);
                return bOwned - aOwned; // True стає 1, False стає 0. 1-0 = -1 (піднімає вгору)
            });

            let firstOwnedItem = null;
            let firstOwnedData = null;

            allCourses.forEach(course => {
                const isOwned = userCourses.includes(course.id);

                const div = document.createElement("div");
                div.className = "menu-item " + (isOwned ? "active" : "locked");
                div.innerText = course.name;

                div.onclick = () => selectCourse(course, isOwned, div);

                menu.appendChild(div);

                // Запам'ятовуємо перший відкритий курс для автокліку
                if (isOwned && !firstOwnedItem) {
                    firstOwnedItem = div;
                    firstOwnedData = course;
                }
            });

            // 2. Автоматичний вибір першого відкритого курсу
            if (firstOwnedItem) {
                selectCourse(firstOwnedData, true, firstOwnedItem);
            } else {
                lessonsContainer.innerHTML = "<p>У тебе поки немає відкритих курсів 🛒</p>";
            }
        })
        .catch(err => {
            console.error("Помилка:", err);
            alert("Помилка завантаження курсів");
        });
}

// ---------------- SELECT COURSE ----------------
function selectCourse(course, isOwned, element) {

    if (!isOwned) {
        Swal.fire({
            icon: "info",
            title: "Курс закритий",
            text: "Спочатку купи його 💎"
        });
        return;
    }

    // 🔥 підсвітка вибраного
    document.querySelectorAll(".menu-item")
        .forEach(el => el.classList.remove("selected"));

    element.classList.add("selected");

    console.log("SELECTED COURSE:", course.id);

    loadLessons(course.id);
}

// ---------------- LESSONS ----------------
function loadLessons(courseId) {
    fetch(API + "/progress/with-progress/" + courseId + "/" + user.id)
        .then(r => r.json())
        .then(data => {

            lessonsContainer.innerHTML = "";

            if (!data.length) {
                lessonsContainer.innerHTML = "<p>Немає уроків 😢</p>";
                updateProgressBar(0);
                return;
            }

            // 🔥 ПРАВИЛЬНИЙ ПРОГРЕС
            const total = data.length;
            const done = data.filter(l => l.isCompleted).length;

            const percent = Math.round((done / total) * 100);

            updateProgressBar(percent);

            // 🔥 ВІДОБРАЖЕННЯ
            data.forEach((l, index) => {

                const div = document.createElement("div");

                let icon = "";

                if (l.isCompleted) icon = "✅";
                else if (!l.unlocked) icon = "🔒";

                div.className = l.unlocked ? "level-card" : "level-card locked";

                div.innerHTML = `
                    <div>
                        <div class="level-number">Рівень ${index + 1}</div>
                        <div class="level-title">${icon} ${l.title}</div>
                    </div>
                    <div>${l.unlocked ? "▶" : ""}</div>
                `;

                if (l.unlocked) {
                    div.onclick = () => {
                        localStorage.setItem("lessonId", l.id);
                        window.location.href = "quiz.html";
                    };
                }

                lessonsContainer.appendChild(div);
            });
        })
        .catch(() => {
            Swal.fire({
                icon: "error",
                title: "Помилка",
                text: "Не вдалося завантажити уроки"
            });
        });
}

function updateProgressBar(percent) {
    const fill = document.getElementById("progressFill");
    const text = document.getElementById("progressText");

    if (fill && text) {
        fill.style.width = percent + "%";
        text.innerText = `Прогрес: ${percent}%`;
    }
}

// ---------------- NAVIGATION ----------------
function goToProfile() {
    window.location.href = "profile.html";
}

function goToShop() {
    window.location.href = "shop.html";
}