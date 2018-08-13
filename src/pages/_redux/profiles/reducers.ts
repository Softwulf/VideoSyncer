import { Reducer } from 'redux';
import { ProfileState, ProfileActions } from './types';

const defaultState: ProfileState = {
    profiles: [],
    loading: false
}

export const ProfileReducer: Reducer<ProfileState, ProfileActions> = (state = defaultState, action): ProfileState => {
    switch(action.type) {
        case '@@profile/SET_PROFILES':
            return {
                ...state,
                profiles: action.payload.profiles
            };
        case '@@profile/SET_LOADING':
            return {
                ...state,
                loading: action.payload.loading
            }
        default:
            return state;
    }
}