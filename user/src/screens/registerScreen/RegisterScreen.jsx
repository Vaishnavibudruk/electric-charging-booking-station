import React from "react";
import styles from "./RegisterScreen.module.css";
import AuthForm from "../../components/form/authForm/AuthForm";
import Navbar from "../../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { callApi } from "../../config/axiosConfig";

const RegisterScreen = () => {
  const fields = [
    {
      label: "Name",
      name: "userName",
      type: "text",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
    },
    {
      label: "Phone",
      name: "mobile",
      type: "text",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
    },
  ];

  const navigate = useNavigate();

  const handleSumbit = async (formData) => {
    const response = await callApi({
      method: "post",
      url: "/user/register",
      data: formData,
    });

    if (!response.success) {
      return;
    }

    alert(response.data.message);

    navigate("/otp", {
      state: { isFromRegisterScreen: true, data: response.data },
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <AuthForm
        fields={fields}
        buttonText="Register"
        formTitleText="Sign Up"
        bottomText="Already have an account?"
        bottomLink={{ to: "/login", label: "signin" }}
        handleSubmit={handleSumbit}
      />
    </div>
  );
};

export default React.memo(RegisterScreen);
