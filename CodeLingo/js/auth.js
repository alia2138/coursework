// 🔹 Реєстрація
function register(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        alert("Заповни всі поля");
        return;
    }

    fetch("https://localhost:7241/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            return res.text();
        })
        .then(data => {
            alert(data);

            localStorage.setItem("user", JSON.stringify({ name, email }));

            window.location.href = "choose-language.html";
        })
        .catch(err => {
            alert(err.message || "Помилка реєстрації");
        });
}


// 🔹 Логін
function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const btn = document.getElementById("loginBtn");

    if (!email || !password) {
        alert("Заповни всі поля");
        return;
    }

    btn.disabled = true;

    fetch("https://localhost:7241/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            return res.json();
        })
        .then(user => {
            localStorage.setItem("user", JSON.stringify(user));
            alert("Успішний вхід");
            window.location.href = "home.html";
        })
        .catch(err => {
            alert(err.message || "Помилка входу");
        })
        .finally(() => {
            btn.disabled = false;
        });
}