import { Action } from 'redux';

export type ProfileState = {
    profiles: vsync.Profile[]
    loading: boolean
}

export interface SetProfilesAction extends Action {
    type: '@@profile/SET_PROFILES';
    payload: {
        profiles: vsync.Profile[]
    };
}

export interface setProfilesLoadingAction extends Action {
    type: '@@profile/SET_LOADING';
    payload: {
        loading: boolean
    };
}

export type ProfileActions = SetProfilesAction | setProfilesLoadingAction;