import React from 'react';
import { resetCookie } from "./auth";
import { Redirect } from "react-router";

export const axiosConfig = (accessToken = '') => {
    return {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        validateStatus: function (status) {
            return status < 500;
        }
    };
};

export const expireAuth = () => {
    resetCookie();
    return <Redirect to="/" />
}
