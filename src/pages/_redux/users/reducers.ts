import { Reducer } from 'redux';
import { UserState, UserActions } from './types';

const defaultState: UserState = {
    loading: true
}

export const UserReducer: Reducer<UserState, UserActions> = (state = defaultState, action): UserState => {
    switch(action.type) {
        case '@@user/SET_USER':
            return {
                ...state,
                user: action.payload.user,
                loading: false
            };
        default:
            return state;
    }
}