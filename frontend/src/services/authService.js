import API from './api';

export const registerUser = (userData) => {
  // Adjust role to match backend expected values if needed
  const adjustedUserData = {
    ...userData,
    role: userData.role === 'admin' ? 'admin' : userData.role
  };
  return API.post('/auth/signup', adjustedUserData);
};

export const loginUser = (loginData) => {
  return API.post('/auth/login', loginData);
};
