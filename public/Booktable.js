// Initialize Email.js with your user ID
emailjs.init("7qrk76hvwMuCsqFte");

// Function to send an email when the form is submitted
function sendTable() {
  // Get the form data
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
  };
  console.log(formData)

  // Send the email
  emailjs
    .send("service_kh4kxqh", "template_g2cdg3c", formData)
    .then((response) => {
      console.log("Email sent successfully:", response);
      // Reset the form or display a success message to the user
      document.getElementById("php-email-form").reset();
      // You can also display a success message to the user
      // e.g., document.getElementById("success-message").style.display = "block";
    })
    .catch((error) => {
      console.error("Email sending failed:", error);
      // Display an error message to the user
      // e.g., document.getElementById("error-message").style.display = "block";
    });
}


