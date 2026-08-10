import React from "react";
import styles from "./OtpScreen.module.css";
import AuthForm from "../../components/form/authForm/AuthForm";
import Navbar from "../../components/navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { callApi } from "../../config/axiosConfig";

const OtpScreen = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isFromRegisterScreen = false, data } = state || {};
  const { user_id: userId, email } = data || {};

  const fields = [
    {
      label: "Enter OTP",
      name: "otp",
      type: "number",
    },
    ...(!isFromRegisterScreen
      ? [
          {
            label: "New Password",
            name: "password",
            type: "password",
          },
          {
            label: "Confirm Password",
            name: "confirmPassword",
            type: "password",
          },
        ]
      : []),
  ];

  const handleSumbit = async (formData) => {
    const response = await callApi({
      method: "post",
      url: "/user/verifyOtp",
      data: { ...formData, userId },
    });

    if (!response.success) {
      return;
    }

    alert(response.data.message);
    navigate("/login");
  };

  const handleResendOtp = async (e) => {
    const response = await callApi({
      method: "post",
      url: "/user/resentOtp",
      data: { email, userId },
    });

    if (!response.success) {
      return;
    }

    alert(response.data.message);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <AuthForm
        fields={fields}
        buttonText="Verify OTP"
        formTitleText="Forgot Password"
        handleSubmit={handleSumbit}
        ResendOtpButtonText="Resend OTP"
        handleResendOtp={handleResendOtp}
      />
    </div>
  );
};

export default React.memo(OtpScreen);
