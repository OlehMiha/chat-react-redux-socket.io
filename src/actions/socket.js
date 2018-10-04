import * as types from '../constants/ActionTypes';
import axios from 'axios';
import { preloaderStartAction, preloaderStopAction, asyncAction} from './common';


export const setTokenToSocketStateAction = (token) => {
    return {
        type: types.SET_TOKEN_TO_SOCKET,
        payload: {
            token: token
        }
    }
};

export const setDataAfterAuth = (data) => {
    return {
        type: types.SET_DATA_AFTER_AUTH,
        payload: {
            roles: data.roles,
            user: {
                email: data.email,
                id: data.id
            },
            login: true
        }
    }
};

export const checkLoginSuccess =  (status, data) => {
    return {
        type: types.CHECK_LOGIN_SUCCESS,
        payload: {
            login: true,
            user: data.user,
            token: data.token,
            roles: data.roles
        }
    }
};

export const checkLoginFailed = status => {
    return {
        type: types.CHECK_LOGIN_FAILED,
        payload: {
            login: false
        }
    }
};