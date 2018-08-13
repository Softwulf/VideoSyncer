import { SetProfilesAction, setProfilesLoadingAction } from './types';

export const setProfiles: (profiles: vsync.Profile[]) => SetProfilesAction = (profiles) => {
    return {
        type: '@@profile/SET_PROFILES',
        payload: {
            profiles
        }
    }
}

export const setProfilesLoading: (loading: boolean) => setProfilesLoadingAction = (loading) => {
    return {
        type: '@@profile/SET_LOADING',
        payload: {
            loading
        }
    }
}