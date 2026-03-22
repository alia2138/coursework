function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.querySelector(".overlay");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
}

function goToShop() {
    window.location.href = "shop.html";
}