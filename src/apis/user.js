import axios from 'axios';

import { API_URL, GET_TOKEN_LIST, SCAN_TOKEN_URL } from "../constants/api";
import {axiosConfig}                               from '../utils/api';

const getTokenInfos = async () => {
  try {
    const response = await axios.get(GET_TOKEN_LIST());
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

/**
 * /auth/sendCodeForVerifyRequest
 * @param postData: {sendTypeKind: SendTypeKind, phoneNumber: string, email: string}
 * @returns {Promise<T>}
 */
const sendEmailCode = async (postData) => {
  try {
    const response = await axios.post(
      API_URL + '/auth/sendCodeForVerifyRequest',
      postData,
      axiosConfig(),
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const checkVerifyCode = async (postData) => {
  try {
    const response = await axios.post(
      API_URL + '/auth/checkverifycode',
      postData,
      axiosConfig(),
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const sendCode = async (postData) => {
  try {
    const response = await axios.post(
      API_URL + '/auth/sendCodeForVerifyRequest',
      postData,
      axiosConfig(),
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

const checkIsExistUser = async (queryData) => {
  try {
    const response = await axios.get(API_URL + '/auth/existsByEmail', {
      params: queryData,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const checkIsExistPhoneNumber = async (queryData) => {
  try {
    const response = await axios.get(API_URL + '/auth/existsByPhoneNumber', {
      params: queryData,
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const checkIsExistUserAndEmail = async (queryData) => {
  try {
    const response = await axios.get(API_URL + '/auth/existsByUserIdAndEmailAddress', {
      params: queryData,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    return response.data;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * /auth/signup
 * @param postData: {email, password, name, phoneNumber}
 * @returns {Promise<T>}: {success: boolean, message: string}
 */
const signupUser = async (postData) => {
  try {
    // console.log('postData : ', postData);
    const response = await axios.post(
      API_URL + '/auth/signup',
      postData,
      axiosConfig(),
    );
    // console.log('response : ', response.data);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

/**
 * /auth/changePassword
 * @param accessToken: string
 * @param postData: {email, newPassword: string}
 * @returns {Promise<T>}
 */
const changeUserPassword = async (postData) => {
  try {
    const response = await axios.patch(
      API_URL + '/auth/changePassword',
      postData,
      axiosConfig(),
    );
    return response.data; // return ?
  } catch (e) {
    console.log(e);
    return false;
  }
};

const modifyUser = async (accessToken, postData) => {
  try {
    // console.log('postData : ', postData);
    const response = await axios.post(
      API_URL + '/user/modify',
      postData,
      axiosConfig(accessToken),
    );
    // console.log('response : ', response.data);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export {
  getTokenInfos,
  checkVerifyCode,
  sendEmailCode,
  checkIsExistUser,
  checkIsExistPhoneNumber,
  checkIsExistUserAndEmail,
  sendCode,
  signupUser,
  changeUserPassword,
  modifyUser
};
