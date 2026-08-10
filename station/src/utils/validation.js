/* ===========================
   USER NAME VALIDATION
   =========================== */
/*
Rules:
- Required
- Only alphabets and spaces
- Minimum 3 characters
*/
export const validateUserName = (name) => {
  if (!name || !name.trim()) {
    return "User name is required";
  }

  if (!/^[A-Za-z ]+$/.test(name)) {
    return "User name can contain only letters and spaces";
  }

  if (name.trim().length < 3) {
    return "User name must be at least 3 characters";
  }

  return null; // ✅ valid
};

/* ===========================
   MOBILE NUMBER VALIDATION
   =========================== */
/*
Rules:
- Required
- Indian mobile number
- Starts with 6–9
- Exactly 10 digits
*/
export const validateMobileNumber = (mobile) => {
  if (!mobile) {
    return "Mobile number is required";
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return "Enter a valid 10-digit mobile number";
  }

  return null; // ✅ valid
};

/* ===========================
   EMAIL VALIDATION
   =========================== */
/*
Rules:
- Required
- Standard email format
*/
export const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return "Enter a valid email address";
  }

  return null; // ✅ valid
};

/* ===========================
   PASSWORD VALIDATION
   =========================== */
/*
Rules:
- Minimum 8 characters
- At least:
  - 1 uppercase
  - 1 lowercase
  - 1 number
  - 1 special character
*/
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return null; // ✅ valid
};

const fieldValidationMap = {
  userName: validateUserName,
  mobile: validateMobileNumber,
  userMobile: validateMobileNumber,
  userEmail: validateEmail,
  password: validatePassword,
};

export const validateForm = (fields, formData) => {
  for (let field of fields) {
    const value = formData[field.name];

    // 1️⃣ Required check
    if (!value || !value.toString().trim()) {
      return `${field.label} is required`;
    }

    // 2️⃣ Field-specific validation
    const validator = fieldValidationMap[field.name];
    if (validator) {
      const error = validator(value);
      if (error) return error;
    }
  }

  return null;
};
