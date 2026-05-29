/*
  main.js — She Can Foundation
  ══════════════════════════════
  STEP 3: All JavaScript behaviour.
  Sections:
    A. Grab DOM elements
    B. Helper functions  (showError, clearError, isValidEmail)
    C. Real-time validation  (on blur / on input)
    D. Full form validation  (runs on submit)
    E. Form submission handler
    F. Toast notification
    G. "Send another" reset button
*/


/* ══════════════════════════════════════════
   A. GRAB DOM ELEMENTS
   ══════════════════════════════════════════
   We find every element we'll interact with once,
   up here, so we don't search the DOM repeatedly.
*/
const contactForm    = document.getElementById("contactForm");
const submitBtn      = document.getElementById("submitBtn");
const formWrapper    = document.getElementById("contactForm");   // the <form>
const successSection = document.getElementById("successMessage");
const resetBtn       = document.getElementById("resetBtn");
const toast          = document.getElementById("toast");
const toastClose     = document.getElementById("toastClose");

// Individual fields
const nameField    = document.getElementById("fullName");
const emailField   = document.getElementById("email");
const messageField = document.getElementById("message");

// Error spans (matched by id to each field)
const nameError    = document.getElementById("fullNameError");
const emailError   = document.getElementById("emailError");
const messageError = document.getElementById("messageError");


/* ══════════════════════════════════════════
   B. HELPER FUNCTIONS
   ══════════════════════════════════════════ */

/**
 * showError(field, errorEl, message)
 * ────────────────────────────────────
 * Marks a field as invalid and shows an error message.
 *
 * @param {HTMLElement} field   - The input or textarea
 * @param {HTMLElement} errorEl - The <span> that holds the error text
 * @param {string}      msg     - The message to display
 */
function showError(field, errorEl, msg) {
  field.classList.add("error");           // red border (defined in CSS)
  errorEl.textContent = "⚠ " + msg;
  errorEl.classList.add("visible");       // CSS sets display: block
}

/**
 * clearError(field, errorEl)
 * ───────────────────────────
 * Removes the error state from a field.
 */
function clearError(field, errorEl) {
  field.classList.remove("error");
  errorEl.textContent = "";
  errorEl.classList.remove("visible");
}

/**
 * isValidEmail(value)
 * ────────────────────
 * Returns true if the string looks like a valid email.
 * The regex checks for: something @ something . something
 *
 * @param  {string}  value
 * @returns {boolean}
 */
function isValidEmail(value) {
  // [^\s@]+ means "one or more characters that are NOT space or @"
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}


/* ══════════════════════════════════════════
   C. REAL-TIME VALIDATION
   ══════════════════════════════════════════
   We validate each field in two moments:

   1. "blur"  — when the user LEAVES the field.
                Catches empty fields after tabbing away.

   2. "input" — as the user TYPES after an error was shown.
                Clears the error the moment the input becomes valid,
                giving instant positive feedback.
*/

// ── Full Name ──
nameField.addEventListener("blur", () => {
  if (!nameField.value.trim()) {
    showError(nameField, nameError, "Full name is required.");
  } else if (nameField.value.trim().length < 2) {
    showError(nameField, nameError, "Name must be at least 2 characters.");
  } else {
    clearError(nameField, nameError);
  }
});

nameField.addEventListener("input", () => {
  // Only clear — don't re-show errors while typing
  if (nameField.value.trim().length >= 2) {
    clearError(nameField, nameError);
  }
});

// ── Email ──
emailField.addEventListener("blur", () => {
  if (!emailField.value.trim()) {
    showError(emailField, emailError, "Email address is required.");
  } else if (!isValidEmail(emailField.value)) {
    showError(emailField, emailError, "Please enter a valid email (e.g. name@example.com).");
  } else {
    clearError(emailField, emailError);
  }
});

emailField.addEventListener("input", () => {
  if (isValidEmail(emailField.value)) {
    clearError(emailField, emailError);
  }
});

// ── Message ──
messageField.addEventListener("blur", () => {
  if (!messageField.value.trim()) {
    showError(messageField, messageError, "Message is required.");
  } else if (messageField.value.trim().length < 10) {
    showError(messageField, messageError, "Message must be at least 10 characters.");
  } else {
    clearError(messageField, messageError);
  }
});

messageField.addEventListener("input", () => {
  if (messageField.value.trim().length >= 10) {
    clearError(messageField, messageError);
  }
});


/* ══════════════════════════════════════════
   D. FULL FORM VALIDATION
   ══════════════════════════════════════════
   Runs when the user clicks Submit.
   Checks every field and shows all errors at once.
   Returns true only if everything is valid.
*/
function validateAll() {
  // We track validity for each field separately so ALL errors show at once
  let isValid = true;

  // ── Validate: Full Name ──
  if (!nameField.value.trim()) {
    showError(nameField, nameError, "Full name is required.");
    isValid = false;
  } else if (nameField.value.trim().length < 2) {
    showError(nameField, nameError, "Name must be at least 2 characters.");
    isValid = false;
  } else {
    clearError(nameField, nameError);
  }

  // ── Validate: Email ──
  if (!emailField.value.trim()) {
    showError(emailField, emailError, "Email address is required.");
    isValid = false;
  } else if (!isValidEmail(emailField.value)) {
    showError(emailField, emailError, "Please enter a valid email (e.g. name@example.com).");
    isValid = false;
  } else {
    clearError(emailField, emailError);
  }

  // ── Validate: Message ──
  if (!messageField.value.trim()) {
    showError(messageField, messageError, "Message is required.");
    isValid = false;
  } else if (messageField.value.trim().length < 10) {
    showError(messageField, messageError, "Message must be at least 10 characters.");
    isValid = false;
  } else {
    clearError(messageField, messageError);
  }

  return isValid;
}


/* ══════════════════════════════════════════
   E. FORM SUBMISSION HANDLER
   ══════════════════════════════════════════
   Listens for the form's "submit" event.
   e.preventDefault() stops the browser from
   doing a full page reload (the default behaviour).
*/
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop default browser form submission

  // Run full validation — stop here if anything is invalid
  if (!validateAll()) return;

  // ── Start loading state ──
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  /*
    Build the data object we'll send to the backend.
    .trim() removes any accidental leading/trailing spaces.
  */
  const formData = {
    full_name: nameField.value.trim(),
    email:     emailField.value.trim().toLowerCase(),
    message:   messageField.value.trim(),
  };

  try {
  const res = await fetch("/api/contact", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(formData),
  });

  const data = await res.json();

  if (data.success) {
    showSuccess();
    showToast();
  } else {
    // Show server-side validation errors if any
    alert(data.errors.join("\n"));
  }
  } catch (err) {
    /*
      If something goes wrong (network error, server error),
      show a simple alert. Step 4 will improve this.
    */
    alert("Something went wrong. Please try again.\n\n" + err.message);

  } finally {
    // Always re-enable the button, whether success or error
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
});

/**
 * simulateSubmit(data)
 * ─────────────────────
 * Pretends to send data to a server by waiting 1.5 seconds.
 * We'll replace this in Step 4 with a real fetch() to the Express backend.
 *
 * @param {object} data - The form data
 * @returns {Promise}
 */

/**
 * showSuccess()
 * ──────────────
 * Hides the form and reveals the success message.
 */
function showSuccess() {
  formWrapper.style.display    = "none";
  successSection.removeAttribute("hidden");
  // Scroll smoothly to the success message
  successSection.scrollIntoView({ behavior: "smooth", block: "center" });
}


/* ══════════════════════════════════════════
   F. TOAST NOTIFICATION
   ══════════════════════════════════════════
   A small popup in the top-right corner.
   Adding class "show" triggers the CSS slide-in transition.
   It auto-dismisses after 5 seconds.
*/
function showToast() {
  toast.classList.add("show");

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    toast.classList.remove("show");
  }, 5000);
}

// Manual close when user clicks ✕
toastClose.addEventListener("click", () => {
  toast.classList.remove("show");
});


/* ══════════════════════════════════════════
   G. "SEND ANOTHER MESSAGE" RESET
   ══════════════════════════════════════════
   Clears the form and swaps the success view
   back to the form view.
*/
resetBtn.addEventListener("click", () => {
  // Clear all field values
  contactForm.reset();

  // Clear any leftover error states
  clearError(nameField,    nameError);
  clearError(emailField,   emailError);
  clearError(messageField, messageError);

  // Show form, hide success message
  formWrapper.style.display = "block";
  successSection.setAttribute("hidden", "");
});
