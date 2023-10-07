function addToCart(button) {
  // Retrieve the item information from the button's data attributes
  let itemName = button.getAttribute('data-name');
  let itemPrice = parseFloat(button.getAttribute('data-price'));

  // Retrieve the current cart data from localStorage (if any)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Add the selected item to the cart
  cart.push({ name: itemName, price: itemPrice });

  // Store the updated cart data back in localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Update the cart count and cart elements on the page
  updateCartCount();
  updateCartElements();

  // Append the item to the cart list with the "remove-button" class
  let cartList = document.getElementById('cart-list');
  let newItemIndex = cart.length - 1;
  let newItemHTML = `<li>${itemName}: ₹${itemPrice.toFixed(2)} <button class="remove-button" onclick="removeFromCart(${newItemIndex})">x</button></li>`;
  cartList.innerHTML += newItemHTML;
}

function removeFromCart(index) {
  // Retrieve the current cart data from localStorage (if any)
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Remove the item at the specified index
  cart.splice(index, 1);

  // Store the updated cart data back in localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Update the cart count and cart elements on the page
  updateCartCount();
  updateCartElements();
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let itemCount = cart.length;

  // Update the cart count on the page
  document.getElementById('item-count').textContent = itemCount;
}

function clearCart() {
  localStorage.removeItem('cart'); // Remove the cart data
  updateCartCount(); // Update the cart count (should be zero)
  updateCartElements(); // Update the cart elements on the page
}

function updateCartElements() {
  // Retrieve the cart data from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Initialize variables to store the HTML for cart items and the total cost
  let cartHTML = '';
  let totalCost = 0;

  // Iterate through the items in the cart
  cart.forEach((item, index) => {
    // Increment the total cost
    totalCost += item.price;

    // Create a list item to display the item's name, price, and a remove button
    cartHTML += `<li>${item.name}: ₹${item.price.toFixed(2)} <button class="remove-button" onclick="removeFromCart(${index})">x</button></li>`;
  });

  // Update the cart count, total, and cart list elements in the HTML
  document.getElementById('item-count').textContent = cart.length;
  document.getElementById('total').textContent = totalCost.toFixed(2);
  document.getElementById('cart-list').innerHTML = cartHTML;
}

// Call the updateCartElements function when the page loads
window.onload = updateCartElements;
