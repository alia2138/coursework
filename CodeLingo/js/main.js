function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".overlay");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
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

function toChose() {
    window.location.href = "choose-language.html";
}