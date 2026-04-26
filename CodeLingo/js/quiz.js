const API = "https://localhost:7241/api";

const lessonId = localStorage.getItem("lessonId");

let questions = [];
let current = 0;
let progress = 0;
let selectedAnswer = null;
let dragItem = null;

// 🔥 НОВЕ
let correctCount = 0;

// 🔹 Завантаження
fetch(API + "/question/" + lessonId)
    .then(r => r.json())
    .then(data => {
        questions = data;
        showQuestion();
    })
    .catch(() => alert("Помилка завантаження питань"));

// 🔹 Показ питання
function showQuestion() {

    const q = questions[current];

    document.getElementById("questionText").innerText = q.text;

    const container = document.getElementById("answersContainer");
    container.innerHTML = "";

    selectedAnswer = null;

    // 🔹 TEST
    if (q.type === "test") {
        const options = JSON.parse(q.optionsJson);

        options.forEach(opt => {
            const div = document.createElement("div");
            div.className = "answer";
            div.innerText = opt;

            div.onclick = () => {
                selectedAnswer = opt;

                document.querySelectorAll(".answer")
                    .forEach(a => a.style.border = "none");

                div.style.border = "2px solid green";
            };

            container.appendChild(div);
        });
    }

    // 🔹 CODE
    if (q.type === "code") {
        container.innerHTML = `<textarea id="codeAnswer" placeholder="Введи код..."></textarea>`;
    }
}

// 🔹 Drag
function addDragEvents(el) {
    el.addEventListener("dragstart", () => {
        dragItem = el;
        el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
    });

    el.addEventListener("dragover", (e) => e.preventDefault());

    el.addEventListener("drop", (e) => {
        e.preventDefault();

        if (dragItem !== el) {
            const list = el.parentNode;
            const children = Array.from(list.children);

            const dragIndex = children.indexOf(dragItem);
            const dropIndex = children.indexOf(el);

            if (dragIndex < dropIndex) {
                list.insertBefore(dragItem, el.nextSibling);
            } else {
                list.insertBefore(dragItem, el);
            }
        }
    });
}

// 🔹 ПЕРЕВІРКА
function checkAnswer() {

    const q = questions[current];
    let isCorrect = false;

    // 🔹 TEST
    if (q.type === "test") {

        if (!selectedAnswer) {
            Swal.fire({
                icon: "error",
                title: "Помилка!",
                text: "Обери відповідь"
            });
            return;
        }

        const normalize = (str) => str.trim().toLowerCase();

        isCorrect = normalize(selectedAnswer) === normalize(q.correctAnswer);

        if (isCorrect)  {
            correctCount++;
            progress++;
            updateProgress();
            Swal.fire({
                icon: "success",
                title: "Молодець!",
                text: "Ця відповідь була правильна"
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "От халепа!",
                text: "Ти помилився"
            });
        }

        nextQuestion();
    }

    // 🔹 CODE
    if (q.type === "code") {

        const normalize = (str) =>
            str.replace(/\s+/g, "")
                .replace(/;/g, "")
                .toLowerCase();

        const user = document.getElementById("codeAnswer").value;

        isCorrect = normalize(user) === normalize(q.correctAnswer);

        if (isCorrect)  {
            correctCount++;
            progress++;
            updateProgress();
            Swal.fire({
                icon: "success",
                title: "Молодець!",
                text: "Ця відповідь була правильна"
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "От халепа!",
                text: "Ти помилився"
            });
        }

        nextQuestion();
    }
}

// 🔹 НАСТУПНЕ
function nextQuestion() {
    current++;

    if (current >= questions.length) {
        finishLesson();
        return;
    }

    showQuestion();
}

// 🔥 ГОЛОВНЕ — ЗАВЕРШЕННЯ УРОКУ
function finishLesson() {

    fetch(API + "/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: 1,
            lessonId: Number(lessonId),
            correctAnswers: correctCount,
            totalQuestions: questions.length
        })
    })
        .then(r => r.json())
        .then(res => {

            if (res.isCompleted) {
                Swal.fire({
                    icon: "success",
                    title: "Урок пройдено!",
                    text: `Правильно: ${correctCount}/${questions.length} | Нагорода: ${res.reward} 💎`
                }).then(() => {
                    window.location.href = "home.html";
                });

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Недостатньо балів",
                    text: `Правильно: ${correctCount}/${questions.length} (${res.percent}%)`
                }).then(() => {
                    window.location.href = "home.html";
                });
            }
        });
}

function updateProgress() {
    const percent = (progress / questions.length) * 100;
    document.getElementById("progressFill").style.width = percent + "%";
}

