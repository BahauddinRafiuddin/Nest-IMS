import api from "./axios"


export const createCompany = async (data) => {
  const res = await api.post(`/company`, data)
  return res.data
}

export const getAllcompanies = async () => {
  const res = await api.get('/company')
  return res.data
}

export const toggleCompanyStatus = async (id) => {
  const res = await api.patch(`/company/${id}/toggle-status`)
  return res.data
}

export const getSuperAdminDashboard = async () => {
  const res = await api.get("dashboard/super-admin");
  return res.data;
}

export const getCompanyFinanceOverview = async () => {
  const res = await api.get('/superadmin/finance-data')
  return res.data;
}

export const getCompanyRevenueDetails = async (companyId) => {
  const res = await api.get(`/company/${companyId}/finance`);
  return res.data;
}

export const getPlatformFinanceStats = async () => {
  const res = await api.get('/dashboard/platform-finance')
  return res.data
}

export const updateCompanyCommission = async (companyId, commissionPercentage) => {
  const res = await api.patch(
    `/company/${companyId}/commission`,
    { commissionPercentage }
  )
  return res.data
}

export const getAllTransactionReport = async (
  filters = {}
) => {
  const query = new URLSearchParams(filters).toString()

  const res = await api.get(
    `/dashboard/company-transaction-report?${query}`
  )

  return res.data
}

export const getAllCompaniesCommissionHistory = async () => {
  const res = await api.get('/superadmin/comission-history')
  return res.data
}
export const exportCompanyCommissionHistory = async (companyId, format) => {
  try {
    const res = await api.get(
      `/superadmin/comission-history/export/${companyId}?format=${format}`,
      {
        responseType: "blob", // ✅ VERY IMPORTANT
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;

    link.setAttribute(
      "download",
      `commission-history.${format === "excel" ? "xlsx" : "pdf"}`
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed", error);
  }
};

export const getSingleCompanyComissionHistory = async (companyId, page, limit) => {
  const res = await api.get(
    `/company/${companyId}/commission-history?page=${page}&limit=${limit}`
  )

  return res.data
}

export const getPendingReviews = async () => {
  const res = await api.get('/review/pending')
  return res.data
}

export const approveReview = async (reviewId) => {
  const res = await api.patch(`/review/${reviewId}/approve`)
  return res.data
}

export const rejectReview = async (reviewId) => {
  const res = await api.patch(`/review/${reviewId}/reject`)
  return res.data
}