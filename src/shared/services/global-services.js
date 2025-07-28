import { STORAGE_KEY } from "../keys";

export const getTokenAsync = () => {
  return new Promise((resolve) => {
    const token = localStorage.getItem(STORAGE_KEY.TOKEN);
    if (token) {
      resolve(token);
    } else {
      resolve(null); // No token, resolve as null
    }
  });
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateStudentNumber = (studentNumber) => {
  const studentNumberRegex = /^[0-9]{6,12}$/;
  return studentNumberRegex.test(studentNumber);
};

export const validatePhoneNumber = (phoneNumber) => {
  const phoneNumberRegex = /^[0-9]{10,11}$/;
  return phoneNumberRegex.test(phoneNumber);
};

// validation.js
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  } else if (!hasUpperCase) {
    return "Password must contain at least one uppercase letter.";
  } else if (!hasLowerCase) {
    return "Password must contain at least one lowercase letter.";
  } else if (!hasNumber) {
    return "Password must contain at least one number.";
  } else if (!hasSpecialChar) {
    return "Password must contain at least one special character.";
  } else {
    return ""; // No errors, password is valid.
  }
};

// Toast service
class ToastService {
  constructor() {
    this.showToastCallback = null;
  }

  registerShowToastCallback(callback) {
    this.showToastCallback = callback;
  }

  show(message, variant = "success") {
    if (this.showToastCallback) {
      this.showToastCallback(message, variant);
    }
  }
}

export const toastService = new ToastService();

// for avatar
// src/utils/avatarUtils.js

export function stringToColor(string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

export function stringAvatar(firstName, lastName, size, fontSize) {
  // Extract the first word of the firstName and lastName
  const firstNameFirstWord = (firstName || "").split(" ")[0];
  const lastNameFirstWord = (lastName || "").split(" ")[0];

  // Combine first and last names to create the name string
  const name = `${firstNameFirstWord || ""} ${lastNameFirstWord || ""}`.trim();

  // Generate initials from the first letters of the first words
  const initials = `${
    firstNameFirstWord ? firstNameFirstWord[0].toUpperCase() : ""
  }${lastNameFirstWord ? lastNameFirstWord[0].toUpperCase() : ""}`;

  return {
    sx: {
      bgcolor: stringToColor(name),
      width: size,
      height: size,
      fontSize: fontSize,
    },
    children: initials || "N/A",
    alt: `${firstName || ""} ${lastName || ""}`,
  };
}

export function removeEmptyFields(formData) {
  const cleanedData = {};

  Object.keys(formData).forEach((key) => {
    const value = formData[key];

    // Check if the value is a string before calling trim
    if (typeof value === "string" && value.trim() !== "") {
      cleanedData[key] = value.trim();
    } else if (value !== null && value !== undefined) {
      // For non-string values, just add them as is
      cleanedData[key] = value;
    }
  });

  return cleanedData;
}

// Capitalizes the first letter of each word in the string
export const capitalizeText = (text) => {
  if (!text) return text;
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const sortByLatestDateOrLastName = (combinedData) => {
  return combinedData.sort((a, b) => {
    const dateA = a.latestDate ? new Date(a.latestDate) : null;
    const dateB = b.latestDate ? new Date(b.latestDate) : null;

    if (dateA && dateB) {
      return dateB - dateA;
    }

    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;

    const lastNameA = a.lastName.toLowerCase();
    const lastNameB = b.lastName.toLowerCase();
    if (lastNameA < lastNameB) return -1;
    if (lastNameA > lastNameB) return 1;

    return 0;
  });
};
