import axios from 'axios';

import {API_URL} from '../constants/api';
import {axiosConfig} from '../utils/api';

const adminLogin = async (body) => {
  try {
    const response = await axios.post(API_URL + '/auth/login', body, {
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500;
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const logout = async (body) => {
  try {
    const response = await axios.get(API_URL + '/auth/logout', {
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500;
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const verifyUser = async (accessToken) => {
  try {
    const response = await axios.get(
      API_URL + '/user/me',
      axiosConfig(accessToken),
    );
    return response.data;
  } catch (e) {
    console.log(e);
    return {result: 0};
  }
};

export {adminLogin, logout, verifyUser};
