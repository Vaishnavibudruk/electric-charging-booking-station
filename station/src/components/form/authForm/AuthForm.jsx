import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import styles from "./AuthForm.module.css";
import { AppAssets } from "../../../constants/AppAssets";
import AOS from "aos";
import "aos/dist/aos.css";
import { validateForm } from "../../../utils/validation";

function AuthForm({
  handleSubmit,
  fields,
  buttonText,
  formTitleText,
  bottomText,
  forgotPasswordText,
  bottomLink,
  styleFormDiv,
  ResendOtpButtonText,
  backArrorIcon,
  handleResendOtp,
}) {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInput = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const error = validateForm(fields, formData);

      if (error) {
        alert(error);
        return;
      }

      handleSubmit(formData);
    },
    [formData, handleSubmit, fields]
  );
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div
      className="container-fluid h-100 d-flex align-items-center justify-content-center"
      data-aos="fade-up"
    >
      <div className="row w-75 h-75 shadow-lg">
        {/* Left Column: Image */}
        <div
          className={`col-lg-7 d-none d-lg-block bg-dark p-0 ${styles.authLeftCol}`}
        >
          <img
            src={AppAssets.loginImg}
            alt="Login"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>

        {/* Right Column: Form */}
        <div
          className={`col-lg-5 d-flex flex-column justify-content-center p-5 ${styles.authRightCol}`}
        >
          <div className={`${styleFormDiv} ${styles.formWrapper}`}>
            <div className="d-flex">
              {backArrorIcon && (
                <Link to="/" className="text-dark">
                  <span className="backArrowIcon me-2">{backArrorIcon}</span>
                </Link>
              )}
              <h4 className="fw-bold w-100 text-center">{formTitleText}</h4>
            </div>

            <form onSubmit={onSubmit}>
              {fields?.map((field, index) => (
                <div className="mb-3 position-relative" key={index}>
                  <label className="form-label">{field?.label}</label>

                  <input
                    type={
                      field?.type === "password" && showPassword
                        ? "text"
                        : field?.type
                    }
                    className="form-control pe-5" // space for eye icon
                    name={field?.name}
                    onChange={handleInput}
                    required
                  />

                  {field?.type === "password" && (
                    <span
                      className={styles.passwordToggleIcon}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </span>
                  )}
                </div>
              ))}
              <div className="d-flex align-items-center justify-content-center">
                <button type="submit" className="btn btn-primary">
                  {buttonText}
                </button>

                {ResendOtpButtonText && (
                  <button
                    type="button"
                    className="btn btn-outline-primary ms-4"
                    onClick={handleResendOtp}
                  >
                    {ResendOtpButtonText}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-2">
              {forgotPasswordText && (
                <Link className="forgotPassword mt-2" to="/forgot-password">
                  {forgotPasswordText}
                </Link>
              )}

              {bottomText && (
                <p>
                  {bottomText} &nbsp;
                  <Link to={bottomLink?.to} className={styles.regLink}>
                    {bottomLink?.label}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AuthForm);
