const axios = require("axios");

const getDynamicPrice = async (payload) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:6001/predict",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data.predicted_price;
  } catch (err) {
    console.error("Pricing API Error:", err.response?.data || err.message);
    return null;
  }
};

module.exports = getDynamicPrice;
