import { Action } from 'redux';

export type UserState = {
    user?: VSync.User
}

export interface SetUserAction extends Action {
    type: '@@user/SET_USER';
    payload: {
        user?: VSync.User
    };
}

export type UserActions = SetUserAction;