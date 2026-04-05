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
