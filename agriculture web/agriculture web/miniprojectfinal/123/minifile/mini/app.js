// ================== LANGUAGE HANDLER ==================
function applyTranslations() {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  const langData = translations[lang];

  // Replace text content based on data-i18n attributes
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (langData[key]) {
      el.textContent = langData[key];
    }
  });
}

// ================== ROLE SELECTION ==================
function selectRole(role) {
  localStorage.setItem("userRole", role);
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      localStorage.setItem("username", username);
      window.location.href = "index.html";
    });
  }

  // Language select on dashboard
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const selectedLang = langSelect.value;
      localStorage.setItem("preferredLanguage", selectedLang);

      const role = localStorage.getItem("userRole");
      if (role === "farmer") {
        window.location.href = "farmer.html";
      } else if (role === "buyer") {
        window.location.href = "buyer.html";
      }
    });
  }
});
