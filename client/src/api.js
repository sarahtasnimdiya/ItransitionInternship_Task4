import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default {
  login:    (email, password) => http.post('/auth/login',    { email, password }).then(r => r.data),
  register: (name, email, password) => http.post('/auth/register', { name, email, password }).then(r => r.data),
  verifyEmail: (token) => http.get(`/auth/verify/${token}`).then(r => r.data), // add this

  getUsers:        ()    => http.get('/users').then(r => r.data),
  blockUsers:      (ids) => http.post('/users/block',    { ids }).then(r => r.data),
  unblockUsers:    (ids) => http.post('/users/unblock',  { ids }).then(r => r.data),
  deleteUsers:     (ids) => http.delete('/users',        { data: { ids } }).then(r => r.data),
  deleteUnverified: (ids) => http.delete('/users/unverified', { data: { ids } }).then(r => r.data),
};
