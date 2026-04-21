const API = "https://localhost:7241/api";

const lessonId = localStorage.getItem("lessonId");

if (!lessonId) {
    alert("Урок не знайдено");
    window.location.href = "home.html";
}

fetch(API + "/lesson/single/" + lessonId)
    .then(r => r.json())
    .then(lesson => {
        document.getElementById("lessonTitle").innerText = lesson.title;
        document.getElementById("lessonTheory").innerText = lesson.theory;
    });

function startQuiz() {
    window.location.href = "quiz.html";
}