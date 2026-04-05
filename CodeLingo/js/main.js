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

window.alert = function(message) {
    Swal.fire({
        text: message,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
        background: '#ffffff',
        color: '#333',
        backdrop: false
    });
};

