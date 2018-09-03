import { Action } from 'redux';

export type SeriesState = {
    series_list: VSync.Series[]
    loading: boolean
}

export interface SetSeriesListAction extends Action {
    type: '@@series/SET_SERIES_LIST';
    payload: {
        series_list: VSync.Series[]
    };
}

export interface SetSeriesLoadingAction extends Action {
    type: '@@series/SET_LOADING';
    payload: {
        loading: boolean
    };
}

export type SeriesAction = SetSeriesListAction | SetSeriesLoadingAction;