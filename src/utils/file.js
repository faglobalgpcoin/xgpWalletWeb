import axios from 'axios';
import { API_URL } from '../constants/api';

export const uploadToS3 = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(API_URL + '/s3/upload', formData);
    return response.data;
  } catch (e) {
    console.log(e);
  }
};
