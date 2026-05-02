const API = "https://localhost:7241/api";

const lessonId = localStorage.getItem("lessonId");
let user = JSON.parse(localStorage.getItem("user"));

if (!user || user.hearts <= 0) {
    Swal.fire({
        icon: "error",
        title: "Немає життів 💔"
    }).then(() => {
        window.location.href = "home.html";
    });
}

// ---------------- STATE ----------------
let questions = [];
let current = 0;
let correctCount = 0;
let selectedAnswer = null;

// ---------------- LOAD QUESTIONS ----------------
fetch(API + "/question/" + lessonId)
    .then(r => r.json())
    .then(data => {

        if (!data || data.length === 0) {
            Swal.fire("Немає питань");
            return;
        }

        questions = data;
        showQuestion();
    });

// ---------------- SHOW ----------------
function showQuestion() {

    const q = questions[current];

    document.getElementById("questionText").innerText = q.text;

    const container = document.getElementById("answersContainer");
    container.innerHTML = "";

    selectedAnswer = null;

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

    if (q.type === "code") {
        container.innerHTML = `<textarea id="codeAnswer"></textarea>`;
    }
}

// ---------------- CHECK ----------------
function checkAnswer() {

    const q = questions[current];
    let isCorrect = false;

    if (q.type === "test") {

        if (!selectedAnswer) {
            Swal.fire("Обери відповідь");
            return;
        }

        isCorrect = selectedAnswer.trim().toLowerCase() ===
            q.correctAnswer.trim().toLowerCase();
    }

    if (q.type === "code") {

        const userAnswer = document.getElementById("codeAnswer").value;

        isCorrect = userAnswer.replace(/\s/g, "") ===
            q.correctAnswer.replace(/\s/g, "");
    }

    if (isCorrect) {
        correctCount++;

        Swal.fire({
            icon: "success",
            title: "Правильно!"
        });

    } else {

        loseHeart();

        Swal.fire({
            icon: "error",
            title: "Помилка"
        });
    }

    setTimeout(nextQuestion, 800);
}

// ---------------- HEART ----------------
function loseHeart() {

    fetch(API + "/heart/lose/" + user.id, {
        method: "POST"
    })
        .then(r => r.json())
        .then(data => {

            user.hearts = data.hearts;
            localStorage.setItem("user", JSON.stringify(user));

            if (user.hearts <= 0) {
                Swal.fire({
                    icon: "error",
                    title: "Життя закінчились 💔"
                }).then(() => {
                    window.location.href = "home.html";
                });
            }
        });
}

// ---------------- NEXT ----------------
function nextQuestion() {

    current++;

    if (current >= questions.length) {
        finishLesson();
        return;
    }

    showQuestion();
    updateLiveProgress()
}

function updateLiveProgress() {
    const fill = document.getElementById("quizProgressFill");
    if (!fill || questions.length === 0) return;

    const progressPercent = ((current) / questions.length) * 100;

    fill.style.width = progressPercent + "%";
}

// ---------------- FINISH ----------------
function finishLesson() {
    const progressData = {
        userId: user.id,
        lessonId: Number(lessonId),
        correctAnswers: correctCount,
        totalQuestions: questions.length
    };

    fetch(API + "/progress", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(progressData)
    })
        .then(r => {
            if (!r.ok) throw new Error("Помилка збереження прогресу");
            return r.json();
        })
        .then(res => {

            let icon = "info";
            let title = "Урок завершено";

            if (res.isCompleted) {
                icon = "success";
                title = "Курс пройдено! 🎉";
            } else {
                icon = "warning";
                title = "Спробуй ще раз 📚";
            }

            Swal.fire({
                icon: icon,
                title: title,
                text: `Твій результат: ${res.percentage}% (${correctCount}/${questions.length}) Нагорода: ${res.percentage}💎 `,
                confirmButtonText: "Додому"
            }).then(() => {
                window.location.href = "home.html";
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire("Помилка", "Не вдалося зберегти прогрес", "error");
        });
    updateLiveProgress()
}