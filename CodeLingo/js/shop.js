let gems = 120;

function buyLife(price) {
    if (gems >= price) {
        gems -= price;
        alert("Куплено ❤️!");
    } else {
        alert("Недостатньо алмазів 💎!");
    }
}