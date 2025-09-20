// script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Website loaded successfully ✅");

  // Example: Hero button alert
  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    ctaButton.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Button clicked! 🚀 Redirecting...");
      window.location.href = ctaButton.getAttribute("href");
    });
  }
});
