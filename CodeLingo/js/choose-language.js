const API = "https://localhost:7241/api";

let selectedCourseId = null;

fetch(API + "/course")
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("coursesContainer");

        data.forEach(course => {
            const div = document.createElement("div");
            div.className = "lang-card";
            div.innerText = course.name;

            div.onclick = () => selectCourse(div, course.id);

            container.appendChild(div);
        });
    });


function selectCourse(element, courseId) {
    document.querySelectorAll('.lang-card').forEach(el => {
        el.classList.remove('active');
    });

    element.classList.add('active');
    selectedCourseId = courseId;
}

function confirmLang() {
    const error = document.getElementById('error');

    if (!selectedCourseId) {
        error.textContent = "Обери курс перед продовженням";
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Ти не авторизована");
        return;
    }

    fetch(API + "/user/select-course", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: user.id,
            courseId: selectedCourseId
        })
    })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            return res.text();
        })
        .then(() => {
            alert("Курс обрано!");
            window.location.href = "home.html";
        })
        .catch(err => {
            Swal.fire({
                icon: "error",
                title: "Помилка!",
                confirmButtonText: ""
            })
        });
}