import { Action } from 'redux';

export type UserState = {
    loading: boolean
    user?: VSync.User
}

export interface SetUserAction extends Action {
    type: '@@user/SET_USER';
    payload: {
        user?: VSync.User
    };
}

export type UserActions = SetUserAction;