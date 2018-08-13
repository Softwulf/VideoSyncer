import { Action } from 'redux';

export type UserState = {
    loading: boolean
    user?: firebase.User
}

export interface SetUserAction extends Action {
    type: '@@user/SET_USER';
    payload: {
        user?: firebase.User
    };
}

export type UserActions = SetUserAction;