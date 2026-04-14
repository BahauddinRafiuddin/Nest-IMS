import api from "./axios"

// Get companies
export const getAllCompaniesWithPrograms = async (params = {}) => {
  const res = await api.get('/public/companies', { params })
  return res.data
}

// Send join request (company or program)
export const sendJoinRequest = async ({ companyId, programId = null, message }) => {
  const res = await api.post("/join-request", {
    companyId,
    programId,
    message,
  });
  return res.data;
};

// get my requests
export const getMyRequests = async () => {
  const res = await api.get("/join-request/my");
  return res.data;
};

// export const getMyRequestStatus=async () => {
//   const res=await api.get('/public-user/status')
//   return res.data
// }