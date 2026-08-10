import React from "react";
import styles from "./LoginScreen.module.css";
import AuthForm from "../../components/form/authForm/AuthForm";
import Navbar from "../../components/navbar/Navbar";
import { callApi } from "../../config/axiosConfig";
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
      url: "/station/login",
      data: formData,
    });

    if (!response.success) {
      return;
    }
    localStorage.setItem("station-authentication-token", response.data.token);
    const isStationDetailsExist = response?.data?.isStationDetails;
    const isPortExist = response?.data?.isPortExist;

    alert(response.data.message);

    if (!isStationDetailsExist) {
      navigate("/details-form");
    } else if (!isPortExist) {
      navigate("/details-port");
    } else {
      navigate("/dashboard");
    }
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
