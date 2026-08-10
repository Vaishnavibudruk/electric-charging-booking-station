import React from "react";
import styles from "./ForgotPasswordScreen.module.css";
import AuthForm from "../../components/form/authForm/AuthForm";
import Navbar from "../../components/navbar/Navbar";
import { callApi } from "../../config/axiosConfig";
import { useNavigate } from "react-router-dom";

const ForgotPasswordScreen = () => {
  const fields = [
    {
      label: "Email",
      name: "email",
      type: "email",
    },
  ];

  const navigate = useNavigate();

  const handleSumbit = async (formData) => {
    const response = await callApi({
      method: "post",
      url: "/user/forgotPassword",
      data: formData,
    });

    if (!response.success) {
      return;
    }
    alert(response.data.message);
    navigate("/otp", {
      state: { data: response.data },
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <AuthForm
        fields={fields}
        buttonText="Get OTP"
        formTitleText="Forgot Password"
        handleSubmit={handleSumbit}
      />
    </div>
  );
};

export default React.memo(ForgotPasswordScreen);
