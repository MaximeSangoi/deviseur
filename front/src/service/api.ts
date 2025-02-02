import axios, { type AxiosRequestConfig } from 'axios';

const options:AxiosRequestConfig = {};
options.baseURL = 'http://localhost:3000';

const instance = axios.create(options);

instance.interceptors.response.use(response => {
  return response;
}, error => {
  return Promise.reject(error);
});

export default instance;