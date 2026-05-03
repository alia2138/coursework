const API = "https://localhost:7241/api";
const user = JSON.parse(localStorage.getItem("user"));

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

            console.log("SHOP ITEMS:", items);
            console.log("USER COURSES:", userCourses);

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

                div.innerHTML = `
                <div class="title">${item.name}</div>
                <div class="price">${item.price} 💎</div>
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

    let text = item.type === "donate"
        ? "Купити за реальні гроші?"
        : `Ціна: ${item.price} 💎`;

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
                    Swal.fire(res.message || "Помилка");
                    return;
                }

                user.diamonds = res.diamonds;
                user.hearts = res.hearts || user.hearts;

                localStorage.setItem("user", JSON.stringify(user));

                document.getElementById("diamonds").innerText = user.diamonds;

                const h = document.getElementById("hearts");
                if (h) h.innerText = user.hearts;

                Swal.fire("Успішно!");

                loadShop();
            });

    });
}