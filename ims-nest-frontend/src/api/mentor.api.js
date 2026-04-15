import api from "./axios"

export const getMenorDashboard = async () => {
  const res = await api.get('/dashboard/mentor')
  return res.data
}

export const getMentorPrograms = async (page,limit) => {
  const res = await api.get(`/enrollment/mentor?page=${page}&limit=${limit}`)
  return res.data
}

export const getMentorInterns = async (page,limit) => {
  const res = await api.get(`/enrollment/interns?page=${page}&limit=${limit}`)
  return res.data
}

export const getMentorTasks = async (page, limit, status) => {
  const res = await api.get(`/task/mentorTasks?page=${page}&limit=${limit}&status=${status}`);
  return res.data;
};

export const reviewTask = async (taskId, data) => {
  const res = await api.patch(`/task/${taskId}/review`, data)
  return res.data
}

export const createTask = async (data) => {
  const res = await api.post('/task', data)
  return res.data
}

export const getInternPerformance = async () => {
  const res = await api.get('/dashboard/mentor-performance')
  // console.log("Performance API response:", res);
  return res.data
}

export const completeInternship = async (enrollmentId) => {
  const res = await api.patch(`/enrollment/${enrollmentId}/complete`);
  return res.data;
}