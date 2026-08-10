import React from "react";
import styles from "./LoginScreen.module.css";
import { callApi } from "../../config/axiosConfig";
import Navbar from "../../components/navbar/Navbar";
import AuthForm from "../../components/form/authForm/AuthForm";
import { useNavigate } from "react-router-dom";

const LoginScreen = () => {
  const navigate = useNavigate();

  const fields = [
    {
      label: "Email",
      name: "email",
      type: "email",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
    },
  ];

  const handleSumbit = async (formData) => {
    const response = await callApi({
      method: "post",
      url: "/user/login",
      data: formData,
    });

    if (!response.success) {
      return;
    }
    localStorage.setItem("user-authentication-token", response.data.token);

    alert(response.data.message);
    navigate("/search");
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <AuthForm
        fields={fields}
        buttonText="Login"
        formTitleText="Sign In"
        bottomText="Don't have an account?"
        forgotPasswordText="Forgot Password?"
        bottomLink={{ to: "/register", label: "signup" }}
        handleSubmit={handleSumbit}
      />
    </div>
  );
};

export default LoginScreen;
