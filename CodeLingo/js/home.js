const API = "https://localhost:7241/api";

const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
    alert("Користувач не знайдений");
    window.location.href = "login.html";
}

// 🔥 показати стати
document.getElementById("streak").innerText = user.streak || 0;
document.getElementById("hearts").innerText = user.hearts || 0;
document.getElementById("diamonds").innerText = user.diamonds || 0;

loadCourses();

function loadCourses() {

    Promise.all([
        fetch(API + "/course").then(r => r.json()),
        fetch(API + "/usercourse/" + user.id).then(r => r.json())
    ])
        .then(([allCourses, userCourses]) => {

            console.log("ALL:", allCourses);
            console.log("USER:", userCourses);

            const menu = document.getElementById("courseMenu");
            menu.innerHTML = "";

            if (!allCourses.length) {
                menu.innerHTML = "<p>Немає курсів</p>";
                return;
            }

            allCourses.forEach(course => {

                const isOwned = userCourses.includes(course.id);

                const div = document.createElement("div");
                div.className = "menu-item " + (isOwned ? "active" : "locked");
                div.innerText = course.name;

                div.onclick = () => selectCourse(course, isOwned);

                menu.appendChild(div);
            });

            // 🔥 автоматично вибрати перший доступний курс
            const first = allCourses.find(c => userCourses.includes(c.id));

            if (first) {
                loadLessons(first.id);
            } else {
                document.getElementById("levelsContainer").innerHTML =
                    "<p>У тебе ще немає курсів 😢</p>";
            }
        })
        .catch(err => {
            console.error(err);
            alert("Помилка завантаження курсів");
        });
}

function selectCourse(course, isOwned) {
    if (!isOwned) {
        alert("Цей курс потрібно купити 💎");
        return;
    }

    loadLessons(course.id);
}

function loadLessons(courseId) {

    fetch(API + "/lesson/" + courseId)
        .then(r => r.json())
        .then(lessons => {

            const container = document.getElementById("levelsContainer");
            container.innerHTML = "";

            if (!lessons.length) {
                container.innerHTML = "<p>Немає уроків</p>";
                return;
            }

            lessons.forEach((lesson, index) => {

                const div = document.createElement("div");
                div.className = "level-card";

                div.innerHTML = `
                    <div>
                        <div class="level-number">Рівень ${index + 1}</div>
                        <div class="level-title">${lesson.title}</div>
                    </div>
                    <div>▶</div>
                `;

                div.onclick = () => openLesson(lesson.id);

                container.appendChild(div);
            });
        })
        .catch(() => alert("Помилка завантаження уроків"));
}

function openLesson(lessonId) {
    localStorage.setItem("lessonId", lessonId);
    window.location.href = "lesson.html";
}