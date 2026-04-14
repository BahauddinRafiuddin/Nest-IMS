import api from "./axios"

export const getMenorDashboard = async () => {
  const res = await api.get('/mentor/dashboard')
  return res.data
}

export const getMentorPrograms = async (page,limit) => {
  const res = await api.get(`/mentor/programs?page=${page}&limit=${limit}`)
  return res.data
}

export const getMentorInterns = async (page,limit) => {
  const res = await api.get(`/mentor/interns?page=${page}&limit=${limit}`)
  return res.data
}
export const getMentorTasks = async (page, limit, status) => {
  const res = await api.get(`/mentor/tasks?page=${page}&limit=${limit}&status=${status}`);
  return res.data;
};

export const reviewTask = async (taskId, data) => {
  const res = await api.put(`/mentor/task/${taskId}/review`, data)
  return res.data
}

export const createTask = async (data) => {
  const res = await api.post('/mentor/task', data)
  return res.data
}

export const getInternPerformance = async () => {
  const res = await api.get('/mentor/intern-performance')
  // console.log("Performance API response:", res);
  return res.data
}

export const completeInternship = async (enrollmentId) => {
  const res = await api.post("/mentor/complete", {
    enrollmentId,
  });
  return res.data;
}