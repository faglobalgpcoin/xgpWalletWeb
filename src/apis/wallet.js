import axios from "axios";
import { API_URL, GET_ETHER_ADDRESS, SCAN_TRANSFER_URL, SCAN_TRANSFER_URL_LIMIT } from "../constants/api";
import { axiosConfig } from "../utils/api";

export const sendAsset = async (accessToken, postData) => {
    try {
        const response = await axios.post(
          API_URL + "/wallet/send",
          postData,
          axiosConfig(accessToken)
        );
        return response.data;
    } catch ( e ) {
        console.log(e);
    }
};

export const getTransferEventFromLuniverse = async (address, limit) => {
    try {
        if ( limit ) {
            const response = await axios.get(SCAN_TRANSFER_URL(address));
            return response.data;
        } else {
            const response = await axios.get(SCAN_TRANSFER_URL_LIMIT(address, limit));
            return response.data;
        }

    } catch ( e ) {
        console.log(e);
        return false;
    }
};

export const getEtherAddress = async (postData)=>{
    try {
        const response = await axios.post(
          GET_ETHER_ADDRESS,
          postData,
        );
        return response.data;
    } catch ( e ) {
        console.log(e);
    }
};

export const getBalance = async (accessToken, token, type) => {
    try {
        const response = await axios.get(
          API_URL + "/wallet/getbalance/" + type + "/" + token,
          axiosConfig(accessToken)
        );
        return response.data;
    } catch (e) {
        console.log(e);
    }
};

export const getTransferEvent = async (accessToken, token, type) => {
    try {
        const response = await axios.get(
          API_URL + "/wallet/gettransactions/" + type + "/" + token,
          axiosConfig(accessToken)
        );
        return response.data;
    } catch (e) {
        console.log(e);
    }
}

export const validateAddress = async (postData) => {
    try {
        const response = await axios.post(
          API_URL + "/wallet/validateAddress",
          postData
        );
        return response.data;
    } catch(e) {
        console.log(e);
    }
}