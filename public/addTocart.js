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


  updateCartCount()
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let itemCount = cart.length;

  // Update the cart count on the page
  document.getElementById('item-count').textContent = itemCount;
}

function clearCart() {
  localStorage.removeItem('cart'); // Remove the cart data
  document.getElementById('cart-list').innerHTML = ''; // Clear the displayed cart
  updateCartCount(); // Update the cart count (should be zero)
}


 // Function to update cart-related elements on the page
function updateCartElements() {
  // Retrieve the cart data from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Initialize variables to store the HTML for cart items and the total cost
  let cartHTML = '';
  let totalCost = 0;

  // Iterate through the items in the cart
  cart.forEach((item) => {
    // Increment the total cost
    totalCost += item.price;

    // Create a list item to display the item's name and price
    cartHTML += `<li>${item.name}: ₹${item.price.toFixed(2)}</li>`;
  });

  // Update the cart count, total, and cart list elements in the HTML
  document.getElementById('item-count').textContent = cart.length;
  document.getElementById('total').textContent = totalCost.toFixed(2);
  document.getElementById('cart-list').innerHTML = cartHTML;
}

// Call the updateCartElements function when the page loads
window.onload = updateCartElements;



