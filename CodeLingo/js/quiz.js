const API = "https://localhost:7241/api";

const lessonId = localStorage.getItem("lessonId");

let questions = [];
let current = 0;
let selectedAnswer = null;
let dragItem = null;

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

    // 🔹 ORDER
    if (q.type === "order") {
        const items = JSON.parse(q.optionsJson);

        const list = document.createElement("div");
        list.id = "dragList";

        items.forEach(text => {
            const div = document.createElement("div");
            div.className = "draggable";
            div.innerText = text;
            div.draggable = true;

            addDragEvents(div);

            list.appendChild(div);
        });

        container.appendChild(list);
    }
}

// 🔹 Drag логіка
function addDragEvents(el) {

    el.addEventListener("dragstart", () => {
        dragItem = el;
        el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
    });

    el.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

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

function checkAnswer() {

    const q = questions[current];
    let userAnswer = "";

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

        const normalize = (str) =>
            str.trim().toLowerCase();

        if (normalize(selectedAnswer) === normalize(q.correctAnswer)) {
            Swal.fire({
                icon: "success",
                title: "Молодець!",
                text: "Ця відповідь була правильна"
            });
        } else {Swal.fire({
                icon: "error",
                title: "От халепа!",
                text: "Ти помилився"
        });
        }

        userAnswer = selectedAnswer;
        nextQuestion();
    }

    // 🔹 CODE
    if (q.type === "code") {

        const normalize = (str) => {
            return str
                .replace(/\s+/g, " ")
                .replace(/\n/g, "")
                .replace(/\r/g, "")
                .replace(/\t/g, "")
                .replace(/;/g, "")
                .trim()
                .toLowerCase();
        };

        const user = document.getElementById("codeAnswer").value;
        const correct = q.correctAnswer;

        const userNorm = normalize(user);
        const correctNorm = normalize(correct);

        if (userNorm === correctNorm) {
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

    // 🔹 ORDER
    if (q.type === "order") {

        const items = document.querySelectorAll("#dragList .draggable");

        let userArr = [];
        items.forEach(i => userArr.push(i.innerText.trim()));

        let correctArr = [];

        const isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);

        if (isCorrect) {
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

function nextQuestion() {
    current++;

    if (current >= questions.length) {
        Swal.fire({
            icon: "success",
            title: "Урок завершено!",
            text: "Ти відповів правильно на ?/? питань"});
        window.location.href = "home.html";
        return;
    }

    showQuestion();
}