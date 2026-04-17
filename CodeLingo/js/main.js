
window.alert = function(message) {
    Swal.fire({
        text: message,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
};

if (!window.location.pathname.includes("login.html") &&
    !window.location.pathname.includes("register.html")) {

    const user = localStorage.getItem("user");

    if (!user) {
        window.location.href = "login.html";
    }
}
function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

function goToShop() {
    window.location.href = "shop.html";
}

function goToProfile() {
    window.location.href = "profile.html";
}

function goBack() {
    window.location.href = "home.html";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}