const API_URL = "http://localhost:5000/api/laptops";

const laptopList = document.getElementById("laptopList");
const addLaptopBtn = document.getElementById("addLaptop");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

let cart = [];

// Fetch laptops from backend and display
async function fetchLaptops() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    laptopList.innerHTML = "";

    data.forEach(laptop => {
      const li = document.createElement("li");
      const imageURL = laptop.image ? `http://localhost:5000${laptop.image}` : 'https://via.placeholder.com/250x150';

      li.innerHTML = `
        <img src="${imageURL}" alt="${laptop.title}">
        <strong>${laptop.title}</strong>
        <div class="price-badge">$${laptop.price}</div>
        <div class="quantity">Qty: ${laptop.quantity}</div>
        <p>${laptop.description}</p>
        <button class="cart">Add to Cart</button>
        <button class="delete">Delete</button>
        <button class="update">Increase Price +100</button>
      `;

      li.querySelector(".cart").addEventListener("click", () => addToCart(laptop));
      li.querySelector(".delete").addEventListener("click", () => deleteLaptop(laptop._id));
      li.querySelector(".update").addEventListener("click", () => updateLaptop(laptop._id));

      laptopList.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching laptops:", err);
  }
}

// Add a new laptop with image
addLaptopBtn.addEventListener("click", async () => {
  const titleEl = document.getElementById("title");
  const priceEl = document.getElementById("price");
  const quantityEl = document.getElementById("quantity");
  const descriptionEl = document.getElementById("description");
  const imageEl = document.getElementById("image");

  const title = titleEl.value.trim();
  const price = parseFloat(priceEl.value);
  const quantity = parseInt(quantityEl.value) || 1;
  const description = descriptionEl.value.trim();
  const imageFile = imageEl.files[0];

  if (!title || isNaN(price) || !description || !imageFile) {
    alert("Please fill in all fields!");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("price", price);
  formData.append("quantity", quantity);
  formData.append("description", description);
  formData.append("image", imageFile);

  try {
    await fetch(API_URL, { method: "POST", body: formData });

    // Clear all form fields after adding
    titleEl.value = "";
    priceEl.value = "";
    quantityEl.value = "";
    descriptionEl.value = "";
    imageEl.value = "";

    fetchLaptops(); // Refresh the list after adding
  } catch (err) {
    console.error("Error adding laptop:", err);
  }
});

// Delete laptop
async function deleteLaptop(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchLaptops();
  } catch (err) {
    console.error("Error deleting laptop:", err);
  }
}

// Update laptop price
async function updateLaptop(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const laptop = await res.json();
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: laptop.price + 100 })
    });
    fetchLaptops();
  } catch (err) {
    console.error("Error updating laptop:", err);
  }
}

// Add to Cart
function addToCart(laptop) {
  const existing = cart.find(item => item._id === laptop._id);
  if (existing) existing.quantity += 1;
  else cart.push({ ...laptop, quantity: 1 });
  renderCart();
}

// Render cart
function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const li = document.createElement("li");
    const imageURL = item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/50';
    li.innerHTML = `
      <img src="${imageURL}" alt="${item.title}" style="width:40px; height:40px; object-fit:cover; margin-right:5px;">
      ${item.title} x ${item.quantity} - $${item.price * item.quantity}
      <button>Remove</button>
    `;
    li.querySelector("button").addEventListener("click", () => removeFromCart(item._id));
    cartList.appendChild(li);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = total.toFixed(2);
}

// Remove from cart
function removeFromCart(id) {
  cart = cart.filter(item => item._id !== id);
  renderCart();
}

// Checkout simulation
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return alert("Cart is empty!");
  alert(`Checkout successful! Total: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}`);
  cart = [];
  renderCart();
});

// Initial fetch
fetchLaptops();
