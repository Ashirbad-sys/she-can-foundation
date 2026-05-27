// validate.js — checks that form data is present and correctly formatted
// Used by the route BEFORE touching the database

function validateContact({ full_name, email, message }) {
  const errors = [];

  if (!full_name || full_name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push("Please enter a valid email address.");
  }

  if (!message || message.trim().length < 10) {
    errors.push("Message must be at least 10 characters.");
  }

  return errors.length === 0
    ? { valid: true }
    : { valid: false, errors };
}

module.exports = { validateContact };