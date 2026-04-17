const API = "https://localhost:7241/api";

function loadCourses() {
    fetch(API + "/course")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("courseSelect");
            select.innerHTML = "";

            data.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id;
                option.textContent = course.name;
                select.appendChild(option);
            });
        });
}

function addCourse() {
    const name = document.getElementById("courseName").value;

    fetch(API + "/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
        .then(res => res.json())
        .then(() => {
            alert("Курс додано");
            loadCourses();
        });
}

function addLesson() {
    const title = document.getElementById("lessonTitle").value;
    const courseId = document.getElementById("courseSelect").value;

    fetch(API + "/lesson", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            courseId: courseId
        })
    });
}

loadCourses();