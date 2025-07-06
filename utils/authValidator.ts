import validator from "validator";

export const isValidEmail = (email: string): boolean => {
    return validator.isEmail(email);

};

export const isValidPassword = (password: string): boolean => {
    return validator.isLength(password, { min: 8 }) &&
           /[A-Z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*]/.test(password);
};
