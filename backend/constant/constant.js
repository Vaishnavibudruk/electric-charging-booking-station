export const sendInternalSeverErrorMsg = (res, err) => {
  console.log("err: ", err);
  return res.status(500).json({
    error: "Internal Server Error",
    message: err?.message || "Unknown error",
  });
};
