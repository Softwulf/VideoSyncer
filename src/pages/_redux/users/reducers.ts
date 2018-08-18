import { Reducer } from 'redux';
import { UserState, UserActions } from './types';

const defaultState: UserState = {
}

export const UserReducer: Reducer<UserState, UserActions> = (state = defaultState, action): UserState => {
    switch(action.type) {
        case '@@user/SET_USER':
            return {
                ...state,
                user: action.payload.user
            };
        default:
            return state;
    }
}