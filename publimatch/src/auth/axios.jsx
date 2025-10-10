import axios from 'axios';

// 1. Create the Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api', // Make sure this is your API's base URL
});

// 2. Create the request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // 3. Get the token from localStorage for every request
    const token = localStorage.getItem('token');
    
    // 4. If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config; // Return the modified config
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default axiosInstance;