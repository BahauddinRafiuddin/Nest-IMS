import api from "./axios"

export const getAllPrograms = async (page, limit, search) => {
  const res = await api.get(`/admin/programs?page=${page}&limit=${limit}&search=${search}`)
  return res.data
}

export const exportProgramsApi = async (search, format) => {
  const res = await api.get(
    `/admin/programs/export?search=${search}&format=${format}`,
    { responseType: "blob" } // Critical for downloading files
  );

  // Logic to trigger browser download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `programs.${format === 'excel' ? 'xlsx' : 'pdf'}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export const createProgram = async (data) => {
  const res = await api.post('/programs', data)
  return res.data
}

export const changeProgramStatus = async (progId, status) => {
  const res = await api.put(`/admin/program/${progId}/status`, { changedStatus: status })
  return res.data
}

export const updateProgram = async (progId, data) => {
  const res = await api.put(`/admin/program/${progId}`, data)
  return res.data
}

export const enrollIntern = async (internId, programId) => {
  const res = await api.post(`/enrollments`, { internId,programId })
  return res.data
};

export const getAvailableInterns = async () => {
  const res = await api.get("/admin/available-interns");
  return res.data;
};
