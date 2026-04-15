import api from "./axios"

export const getMyTasks = async (page, limit, status) => {
  const res = await api.get(`/task/my?page=${page}&limit=${limit}&status=${status}`)
  return res.data
}

export const getMyPerformance = async (programId) => {
  const res = await api.get(`/performance/my/${programId}`)
  return res.data
}

export const getMyProgram = async () => {
  const res = await api.get("/enrollment/my")
  return res.data
}

export const submitTask = async (taskId, data) => {
  const res = await api.patch(`/task/${taskId}/submit`, data)
  return res.data
}

export const checkCertificateEligibility = async (enrollmentID) => {
  const res = await api.get(`/certificate/eligibility/${enrollmentID}`)
  return res.data
}

export const generateCertificate = async (programId) => {
  const res = await api.get(
    `/certificate/download/${programId}`,
    { responseType: "blob" }
  );
  return res.data;
};

export const startInternship = async (enrollmentId) => {
  const res = await api.patch(`/enrollment/${enrollmentId}/start`);
  return res.data;
};

export const createPaymentOrder = async (enrollmentId) => {
  const res = await api.post("/payment/create-order", { enrollmentId });
  return res.data;
};

export const verifyPayment = async (paymentData) => {
  const res = await api.post("/payment/verify", paymentData);
  return res.data;
};

export const getInternPaymentHistory = async () => {
  const res = await api.get('/payment/my-payment-history')
  return res.data
}

export const createReview = async (reviewData) => {
  const res = await api.post('/review', reviewData)
  return res.data
}

export const getMyReview = async () => {
  const res = await api.get('/review/my')
  return res.data
}