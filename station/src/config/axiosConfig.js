import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/",
  timeout: 10000,
});

export const callApi = async ({
  method = "get",
  url,
  data,
  params,
  headers,
}) => {
  try {
    const res = await api({
      method,
      url,
      data,
      params,
      headers,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.log("error: ", error);
    alert(error?.response?.data?.error);
    return {
      success: false,
      error: error?.response?.data || "Network Error",
    };
  }
};
