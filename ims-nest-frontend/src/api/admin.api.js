import api from "./axios"

// Get pending requests (admin)
export const getJoinRequests = async (page = 1, limit = 10) => {
  const res = await api.get(`/join-request?page=${page}&limit=${limit}`);
  return res.data; 
};

// Review request
export const reviewJoinRequest = async (id, action) => {
  const res = await api.patch(`/join-request/${id}`, { action });
  return res.data;
};

export const getDashboardData = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
}

export const getAllInterns = async (page, limit, search) => {
  const res = await api.get(`/admin/interns?page=${page}&limit=${limit}&search=${search}`);
  return res.data;
}

export const exportInternsApi = async (search, format) => {
  const res = await api.get(
    `/admin/intern/export?search=${search}&format=${format}`,
    { responseType: "blob" } // Critical for downloading files
  );

  // Logic to trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `interns.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const getAllMentors = async (page, limit, search) => {
  const res = await api.get(`/admin/mentors?page=${page}&limit=${limit}&search=${search}`)
  return res.data
}

// get mentors to assign the programs
export const getAvailableMentors=async () => {
  const res=await api.get('/admin/availableMentors')
  return res.data
}

export const getCompanyReviews = async (page, limit, minRating) => {
  const res = await api.get(`/admin/reviews?page=${page}&limit=${limit}&minRating=${minRating}`)
  return res.data
}

export const exportReviewsApi = async (rating, format = 'excel') => {
  const res = await api.get(
    `/admin/reviews/export?rating=${rating || ""}&format=${format}`,
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  const ext = format === 'excel' ? 'xlsx' : 'pdf';
  link.setAttribute("download", `Reviews_Report.${ext}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const exportMentorApi = async (search, format) => {
  const res = await api.get(
    `/admin/mentors/export?search=${search}&format=${format}`,
    { responseType: "blob" } // Critical for downloading files
  );

  // Logic to trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `mentors.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const updateInternStatus = async (internId, isActive) => {
  const res = await api.put(`/admin/intern/${internId}/status`, { isActive })
  return res.data;
}

export const assignMentor = async (internId, mentorId) => {
  const res = await api.put("/admin/assign-mentor", { internId, mentorId })
  return res.data
}

export const createMentor = async (data) => {
  const res = await api.post("/admin/mentor", data)
  return res.data
}

export const createIntern = async (data) => {
  const res = await api.post('/admin/intern', data)
  return res.data
}

export const deleteMentorById = async (mentorId) => {
  const res = await api.delete(`/admin/mentor/${mentorId}/delete`)
  return res.data
}

export const getAdminFinanceOverview = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString()
  const res = await api.get(`/admin/finance-overview?${query}`);
  return res.data;
}

export const exportFinanceApi = async (filters, format = 'excel') => {
  // Convert filter object to query string
  const queryString = new URLSearchParams({
    ...filters,
    format
  }).toString();

  const res = await api.get(`/admin/finance/export?${queryString}`, {
    responseType: "blob", // Critical for downloading binary data
  });

  // Logic to trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;

  // Set file extension based on format
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  link.setAttribute("download", `Finance_Report_${new Date().getTime()}.${extension}`);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

