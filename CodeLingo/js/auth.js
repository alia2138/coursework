// Реєстрація
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;

        alert("Користувач " + name + " зареєстрований!");
    });
}
function register() {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("https://localhost:7241/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
        });
    toChose();
}


// Логін
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;

        if (login === "admin@gmail.com" && password === "2138") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "home.html";
        }
        alert("Вхід успішний!")
    });
}

function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("https://localhost:7241/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(user => {

            localStorage.setItem("user", JSON.stringify(user));

            alert("Успішний вхід ✅");

            window.location.href = "home.html";
        })
        .catch(() => {
            alert("Невірний email або пароль ❌");
        });
}