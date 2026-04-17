const API = "https://localhost:7241/api";

function loadCourses() {
    fetch(API + "/course")
        .then(res => res.json())
        .then(courses => {
            const container = document.getElementById("courses");

            courses.forEach(course => {
                const div = document.createElement("div");
                div.className = "level-card";
                div.innerText = course.name;

                div.onclick = () => loadLessons(course.id);

                container.appendChild(div);
            });
        });
}

function loadLessons(courseId) {
    fetch(API + "/lesson/" + courseId)
        .then(res => res.json())
        .then(lessons => {
            const container = document.getElementById("levels");
            container.innerHTML = "";

            lessons.forEach(lesson => {
                const div = document.createElement("div");
                div.className = "level-card";
                div.innerText = lesson.title;

                container.appendChild(div);
            });
        });
}

loadCourses();