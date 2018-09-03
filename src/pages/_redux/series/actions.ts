import { SetSeriesListAction, SetSeriesLoadingAction } from './types';

export const setSeriesList: (series_list: VSync.Series[]) => SetSeriesListAction = (series_list) => {
    return {
        type: '@@series/SET_SERIES_LIST',
        payload: {
            series_list
        }
    }
}

export const setSeriesLoading: (loading: boolean) => SetSeriesLoadingAction = (loading) => {
    return {
        type: '@@series/SET_LOADING',
        payload: {
            loading
        }
    }
}