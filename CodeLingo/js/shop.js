const API = "https://localhost:7241/api";
let user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    alert("Ти не авторизована");
    window.location.href = "login.html";
}

const currencyContainer = document.getElementById("heartsContainer");
const coursesContainer = document.getElementById("coursesContainer");
const donateContainer = document.getElementById("donateContainer");

loadShop();

function loadShop() {

    Promise.all([
        fetch(API + "/shop").then(r => r.json()),
        fetch(API + "/usercourse/" + user.id).then(r => r.json())
    ])
        .then(([items, userCourses]) => {

            userCourses = userCourses || [];

            currencyContainer.innerHTML = "";
            coursesContainer.innerHTML = "";
            donateContainer.innerHTML = "";

            items.forEach(item => {

                const type = item.type.toLowerCase();
                const div = document.createElement("div");
                div.className = "shop-card";

                const isOwned =
                    type === "course" &&
                    item.courseId &&
                    userCourses.includes(item.courseId);

                if (isOwned) {
                    div.classList.add("locked");
                }

                let currency = "💎";

                if (item.type.toLowerCase() === "donate") {
                    currency = "грн";
                }

                div.innerHTML = `
                <div class="shop-title">${item.name}</div>
                <div class="shop-price">${item.price} ${currency}</div>
                 `;


                if (!isOwned) {
                    div.onclick = () => buyItem(item);
                }

                if (type === "hearts") {
                    currencyContainer.appendChild(div);
                }
                else if (type === "course") {
                    coursesContainer.appendChild(div);
                }
                else if (type === "donate") {
                    donateContainer.appendChild(div);
                }

            });

        })
        .catch(err => {
            console.error(err);
            Swal.fire("Помилка", "Не вдалося завантажити магазин", "error");
        });
}

function buyItem(item) {

    const type = item.type.toLowerCase();

    if (type === "donate") {

        window.location.href =
            `pay.html?diamonds=${item.value}&price=${item.price}`;

        return;
    }

    let text = `Ціна: ${item.price} 💎`;

    Swal.fire({
        title: item.name,
        text: text,
        showCancelButton: true,
        confirmButtonText: "Купити"
    }).then(result => {

        if (!result.isConfirmed) return;

        fetch(API + "/shop/buy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id,
                itemId: item.id
            })
        })
            .then(r => r.json())
            .then(res => {

                if (!res.success) {
                    Swal.fire({
                        icon: "error",
                        title: res.message || "Помилка"
                    });
                    return;
                }

                if (res.diamonds !== undefined)
                    user.diamonds = res.diamonds;

                if (res.hearts !== undefined)
                    user.hearts = res.hearts;

                localStorage.setItem("user", JSON.stringify(user));

                const d = document.getElementById("diamonds");
                if (d) d.innerText = user.diamonds;

                const h = document.getElementById("hearts");
                if (h) h.innerText = user.hearts;

                Swal.fire({
                    icon: "success",
                    title: "Куплено!"
                });

                loadShop();
            });

    });
}