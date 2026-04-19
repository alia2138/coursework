const API = "https://localhost:7241/api";

let editingCourseId = null;
let editingLessonId = null;
let editingQuestionId = null;

let courseMode = false;
let lessonMode = false;
let questionMode = false;

loadCourses();

// ================= COURSES =================

function loadCourses(selectedId = null) {
    fetch(API + "/course")
        .then(r => r.json())
        .then(data => {
            courseSelect.innerHTML = "";

            data.forEach(c => {
                courseSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
            });

            if (selectedId) courseSelect.value = selectedId;

            loadLessons();
        });
}

function handleCourseBtn() {
    courseMode ? saveCourse() : toggleCourse();
}

function toggleCourse(edit = false) {
    courseMode = !courseMode;

    courseSelect.classList.toggle("hidden");
    courseInput.classList.toggle("hidden");

    if (edit) {
        editingCourseId = courseSelect.value;
        courseInput.value = courseSelect.options[courseSelect.selectedIndex]?.text || "";
    } else {
        courseInput.value = "";
        editingCourseId = null;
    }
}

function saveCourse() {
    const name = courseInput.value.trim();
    if (!name) return alert("Введи назву");

    const idToKeep = editingCourseId;

    fetch(API + "/course" + (idToKeep ? "/" + idToKeep : ""), {
        method: idToKeep ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name })
    })
        .then(() => {
            toggleCourse();
            loadCourses(idToKeep);
        });
}

function editCourse() {
    if (!courseSelect.value) return alert("Обери курс");
    toggleCourse(true);
}

function deleteCourse() {
    const id = courseSelect.value;
    if (!id) return;

    fetch(API + "/course/" + id, { method: "DELETE" })
        .then(() => loadCourses());
}

// ================= LESSONS =================

function loadLessons(selectedId = null) {
    const courseId = courseSelect.value;
    if (!courseId) return;

    fetch(API + "/lesson/" + courseId)
        .then(r => r.json())
        .then(data => {
            lessonSelect.innerHTML = "";

            data.forEach(l => {
                lessonSelect.innerHTML += `<option value="${l.id}">${l.title}</option>`;
            });

            if (selectedId) lessonSelect.value = selectedId;

            showLesson();
            loadQuestions();
        });
}

function handleLessonBtn() {
    lessonMode ? saveLesson() : toggleLesson();
}

function toggleLesson(edit = false) {
    lessonMode = !lessonMode;

    lessonSelect.classList.toggle("hidden");
    lessonTitleInput.classList.toggle("hidden");
    lessonTheoryInput.classList.toggle("hidden");

    if (!edit) {
        lessonTitleInput.value = "";
        lessonTheoryInput.value = "";
        editingLessonId = null;
    }
}

function saveLesson() {
    const title = lessonTitleInput.value.trim();
    const theory = lessonTheoryInput.value.trim();

    if (!title || !theory) return alert("Заповни всі поля");

    const idToKeep = editingLessonId;

    fetch(API + "/lesson" + (idToKeep ? "/" + idToKeep : ""), {
        method: idToKeep ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            title,
            theory,
            courseId: Number(courseSelect.value)
        })
    })
        .then(() => {
            toggleLesson();
            loadLessons(idToKeep);
        });
}

function editLesson() {
    const id = lessonSelect.value;
    if (!id) return alert("Обери урок");

    fetch(API + "/lesson/single/" + id)
        .then(r => r.json())
        .then(l => {
            toggleLesson(true);

            lessonTitleInput.value = l.title;
            lessonTheoryInput.value = l.theory;

            editingLessonId = l.id;
        });
}

function deleteLesson() {
    const id = lessonSelect.value;
    if (!id) return;

    fetch(API + "/lesson/" + id, { method: "DELETE" })
        .then(() => loadLessons());
}

function showLesson() {
    const id = lessonSelect.value;
    if (!id) return;

    fetch(API + "/lesson/single/" + id)
        .then(r => r.json())
        .then(l => {
            lessonInfo.innerHTML = `<b>${l.title}</b><br>${l.theory}`;
        });
}

// ================= QUESTIONS =================

function loadQuestions() {
    const lessonId = lessonSelect.value;
    if (!lessonId) return;

    fetch(API + "/question/" + lessonId)
        .then(r => r.json())
        .then(data => {
            questionSelect.innerHTML = "";

            data.forEach(q => {
                questionSelect.innerHTML += `<option value="${q.id}">${q.text}</option>`;
            });

            showQuestion();
        });
}

function handleQuestionBtn() {
    questionMode ? saveQuestion() : toggleQuestion();
}

function toggleQuestion(edit = false) {
    questionMode = !questionMode;

    questionText.classList.toggle("hidden");
    questionType.classList.toggle("hidden");
    dynamicFields.classList.toggle("hidden");

    if (edit) {
        editingQuestionId = questionSelect.value;
    } else {
        questionText.value = "";
        dynamicFields.innerHTML = "";
        editingQuestionId = null;
    }
}

function changeQuestionType() {
    const type = questionType.value;
    dynamicFields.innerHTML = "";

    if (type === "test") {
        for (let i = 0; i < 4; i++) {
            dynamicFields.innerHTML += `
                <input placeholder="Варіант ${i+1}" class="opt">
                <input type="radio" name="correct">
                <br>
            `;
        }
    }

    if (type === "code") {
        dynamicFields.innerHTML = `<textarea id="codeAnswer"></textarea>`;
    }

    if (type === "order") {
        for (let i = 0; i < 3; i++) {
            dynamicFields.innerHTML += `<input class="order">`;
        }
    }
}

function saveQuestion() {
    const text = questionText.value.trim();
    const type = questionType.value;

    if (!text) return alert("Введи питання");

    let options = [];
    let correct = "";

    if (type === "test") {
        const inputs = document.querySelectorAll(".opt");
        const radios = document.querySelectorAll("input[name='correct']");

        inputs.forEach(i => options.push(i.value));

        radios.forEach((r, i) => {
            if (r.checked) correct = inputs[i].value;
        });
    }

    if (type === "code") {
        correct = document.getElementById("codeAnswer").value;
    }

    if (type === "order") {
        const inputs = document.querySelectorAll(".order");
        inputs.forEach(i => options.push(i.value));
        correct = JSON.stringify(options);
    }

    fetch(API + "/question" + (editingQuestionId ? "/" + editingQuestionId : ""), {
        method: editingQuestionId ? "PUT" : "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            text,
            type,
            optionsJson: JSON.stringify(options),
            correctAnswer: correct,
            lessonId: Number(lessonSelect.value)
        })
    })
        .then(() => {
            toggleQuestion();
            loadQuestions();
        });
}

function deleteQuestion() {
    const id = questionSelect.value;
    if (!id) return;

    fetch(API + "/question/" + id, { method: "DELETE" })
        .then(() => loadQuestions());
}

function showQuestion() {
    const id = questionSelect.value;
    if (!id) return;

    fetch(API + "/question/get/" + id)
        .then(r => r.json())
        .then(q => {
            questionPreview.innerHTML = `
                <b>${q.text}</b><br>
                Тип: ${q.type}<br>
                Відповідь: ${q.correctAnswer}
            `;
        });
}

// ================= EVENTS =================

courseSelect.onchange = () => loadLessons();
lessonSelect.onchange = () => {
    showLesson();
    loadQuestions();
};