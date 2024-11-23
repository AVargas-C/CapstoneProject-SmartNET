const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

// Existing functionality to handle popup and form transitions
registerLink.addEventListener('click', () => {
  wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
  wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', () => {
  wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
  wrapper.classList.remove('active-popup');
});

// New functionality to handle login form submission and redirection
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener to the login form
  const loginForm = document.querySelector(".form-box.login form");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // Redirect to the dashboard page
    window.location.href = "./pages/1_dashboard/dashboard.html";
  });
});
