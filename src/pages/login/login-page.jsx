import React, { useState } from "react";
import {
  validateEmail,
  toastService,
  ESuccessMessages,
  validatePassword,
  EErrorMessages,
  userSignIn,
} from "../../shared";
import "./login-page.css";

const LoginPage = ({ setFullLoadingHandler, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFullLoadingHandler(true);

    let formIsValid = true;
    let newErrors = { username: "", password: "" };

    if (!formData.username) {
      newErrors.username = EErrorMessages.EMAIL_REQUIRED;
      formIsValid = false;
    }

    if (!formData.password) {
      newErrors.password = EErrorMessages.PASSWORD_REQUIRED;
      formIsValid = false;
    }

    if (!formIsValid) {
      setErrors(newErrors);
      setFullLoadingHandler(false);
      return;
    }

    try {
      const user = await userSignIn({
        username: formData.username,
        password: formData.password,
      });

      console.log(user);
      toastService.show(ESuccessMessages.LOGIN, "success-toast");
      onLoginSuccess(user);
    } catch (error) {
      if (error.errorCode === "USER_NOT_FOUND") {
        newErrors.username = EErrorMessages.USER_NOT_FOUND;
      } else if (error.errorCode === "INVALID_CREDENTIALS") {
        newErrors.password = EErrorMessages.PASSWORD_INCORRECT;
      } else {
        toastService.show(EErrorMessages.CONTACT_ADMIN, "danger-toast");
      }
      setErrors(newErrors);
    }

    setFullLoadingHandler(false);
  };

  return (
    <div className="login-page">
      <div className="login-form d-flex flex-column">
        <div className="login-title mb-3">
          <div className="logo-medium me-3"></div>
          <h1 className="secondary-color fw-bold">Login</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control primary-input"
              id="username"
              name="username"
              placeholder="Your username here"
              value={formData.username}
              onChange={handleChange}
              maxLength={64}
            />
            <label htmlFor="username">Username</label>
            {errors.username && (
              <div className="text-danger error-input-text">
                {errors.username}
              </div>
            )}
          </div>

          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control primary-input"
              id="password"
              name="password"
              placeholder="Your password here"
              value={formData.password}
              onChange={handleChange}
              maxLength={64}
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="btn position-absolute end-0 top-0 mt-2 me-2"
              onClick={togglePasswordVisibility}
            >
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
              ></i>
            </button>
            {errors.password && (
              <div className="text-danger error-input-text">
                {errors.password}
              </div>
            )}
          </div>

          <div className="d-flex flex-column mt-3 align-items-center">
            <button className="primary-button mb-3" type="submit">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
