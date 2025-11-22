export const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i; // Case-insensitive regex
    return emailPattern.test(email);
};