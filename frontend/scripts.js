document.addEventListener("DOMContentLoaded", function () {
    AuthModule.init();

    const bar = document.getElementById("bar");
    const close = document.getElementById("close");
    const nav = document.getElementById("navbar");

    if (bar) {
        bar.addEventListener("click", () => {
            nav.classList.add("active");
        });
    }

    if (close) {
        close.addEventListener("click", () => {
            nav.classList.remove("active");
        });
    }

    if (document.querySelector("#cart")) {
        updateCartDisplay();
        const checkoutBtn = document.getElementById("checkout-btn");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", proceedToCheckout);
        }
    }

    if (document.querySelector(".single-pro-details")) {
        initializeImageSwitcher();

        document.querySelectorAll(".normal").forEach((button) => {
            button.addEventListener("click", function (e) {
                e.preventDefault();

                if (!isLoggedIn()) {
                    alert("You must be logged in to add items to the cart.");
                    return;
                }

                const productElement = this.closest(".single-pro-details");
                const selectElement = productElement.querySelector("select");
                const selectedOption = selectElement.value;

                if (!selectedOption) {
                    selectElement.style.border = "2px solid red";
                    alert("Please select an option before adding to cart!");
                    return;
                }
                selectElement.style.border = "";

                const product = {
                    name: productElement.querySelector("h4").textContent,
                    price: parseFloat(
                        productElement.querySelector("h2").textContent.replace("₹", "").replace(",", "")
                    ),
                    quantity: parseInt(productElement.querySelector("input").value),
                    image: document.querySelector(".MainImg").src,
                    variant: selectedOption,
                };

                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                const existingProduct = cart.find(
                    (item) =>
                        item.name === product.name &&
                        item.variant === product.variant &&
                        item.image === product.image
                );

                if (existingProduct) {
                    existingProduct.quantity += product.quantity;
                } else {
                    cart.push(product);
                }

                localStorage.setItem("cart", JSON.stringify(cart));
                alert(`✅ Product added to cart!\n\n${product.name} (${product.variant})`);
                updateCartDisplay();
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {

    const contactForm = document.querySelector("#contact-form form");
    if (contactForm) {
        const sendMessageBtn = contactForm.querySelector("button.normal");

        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            sendMessageBtn.textContent = "Sending...";

            try {
                const response = await fetch(contactForm.action, {
                    method: "POST",
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    alert("🚀 Message Sent Successfully! Thank you for contacting us. We'll get back to you soon!");
                    contactForm.reset();
                    window.location.href = document.querySelector("input[name='_next']").value;
                } else {
                    throw new Error('Failed to send');
                }
            } catch (error) {
                alert("❌ Failed to send the message. Please try again.");
            } finally {
                sendMessageBtn.disabled = false;
                sendMessageBtn.textContent = "Send Message";
            }
        });
    }
});

function initializeImageSwitcher() {
    const MainImg = document.querySelector(".MainImg");
    const smallImgs = document.querySelectorAll(".small-img");

    if (MainImg && smallImgs) {
        smallImgs.forEach((img) => {
            img.addEventListener("mouseover", () => {
                MainImg.src = img.src;
            });
        });
    }
}

const AuthModule = (() => {
    const elements = {
        signupForm: document.querySelector(".signup-form"),
        loginForm: document.querySelector(".login-form"),
        alertBox: document.querySelector(".alert-box"),
    };

    const endpoints = {
        signup: "http://localhost:5000/api/auth/signup",
        login: "http://localhost:5000/api/auth/login",
    };

    const init = () => {
        setupEventListeners();
    };

    const setupEventListeners = () => {
        if (elements.signupForm) {
            elements.signupForm.addEventListener("submit", handleSignup);
        }

        if (elements.loginForm) {
            elements.loginForm.addEventListener("submit", handleLogin);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const confirmPassword = e.target.elements["confirm-password"].value;

        clearAlert();

        if (!email || !password || !confirmPassword) {
            showAlert("All fields are required.", "error");
            return;
        }

        if (password.length < 6) {
            showAlert("Password must be at least 6 characters.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showAlert("Passwords do not match.", "error");
            return;
        }

        try {
            const response = await fetch(endpoints.signup, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            showAlert("Signup successful!", "success");
            setTimeout(() => (window.location.href = "login.html"), 3000);
        } catch (error) {
            showAlert(error.message || "An error occurred. Please try again.", "error");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;

        clearAlert();

        try {
            const response = await fetch(endpoints.login, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem("userLoggedIn", "true");
            showAlert("Login successful!", "success");
            setTimeout(() => (window.location.href = "index.html"), 3000);
        } catch (error) {
            showAlert(error.message || "An error occurred. Please try again.", "error");
        }
    };

    const showAlert = (message, type) => {
        if (elements.alertBox) {
            elements.alertBox.textContent = message;
            elements.alertBox.className = `alert-box ${type}`;
            elements.alertBox.style.display = "block";
            setTimeout(clearAlert, 3000);
        }
    };

    const clearAlert = () => {
        if (elements.alertBox) {
            elements.alertBox.style.display = "none";
            elements.alertBox.textContent = "";
        }
    };

    return { init };
})();

function updateCartDisplay() {
    const cartContainer = document.querySelector("#cart");
    const subtotalElement = document.querySelector("#subtotal");
    const totalElement = document.querySelector("#total");
    const checkoutButton = document.getElementById("checkout-btn");

    if (!cartContainer || !subtotalElement || !totalElement || !checkoutButton) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p class='empty-cart'>Your cart is empty.</p>";
        subtotalElement.textContent = "₹0";
        totalElement.textContent = "₹0";
        checkoutButton.disabled = true;
        return;
    } else {
        checkoutButton.disabled = false;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                ${item.variant ? `<p class="cart-variant">Variant: ${item.variant}</p>` : ""}
                <p class="cart-price">Price: ₹${item.price.toFixed(2)}</p>
                <p class="item-total">Total: ₹${(item.price * item.quantity).toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    totalElement.textContent = `₹${subtotal.toFixed(2)}`;
}

function changeQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index].quantity + delta > 0) {
        cart[index].quantity += delta;
    } else {
        cart.splice(index, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

function proceedToCheckout() {
    const checkoutBtn = document.getElementById("checkout-btn");
    if (!checkoutBtn) return;

    checkoutBtn.disabled = true;
    checkoutBtn.innerHTML = "Processing...";

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return;

    document.body.innerHTML = `
        <div class="checkout-wrapper">
            <div class="checkout-animation">
                <h1>Processing Your Order...</h1>
                <p>Hang tight! We are confirming your order details.</p>
                <div class="loader"></div>
                <p>You will be redirected shortly...</p>
            </div>
        </div>
    `;

    setTimeout(() => {
        document.body.innerHTML = `
            <div class="order-confirmation-wrapper">
                <h1 class="order-confirmation">🎉 Order Confirmed! Thank you for shopping with us! 🎉</h1>
            </div>
        `;
        localStorage.removeItem("cart");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 3000);
    }, 3000);
}

function isLoggedIn() {
    return localStorage.getItem("userLoggedIn") === "true";
}