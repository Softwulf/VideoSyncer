import { Reducer } from 'redux';
import { SeriesState, SeriesAction } from './types';

const defaultState: SeriesState = {
    series_list: [],
    loading: false
}

export const SeriesReducer: Reducer<SeriesState, SeriesAction> = (state = defaultState, action): SeriesState => {
    switch(action.type) {
        case '@@series/SET_SERIES_LIST':
            return {
                ...state,
                series_list: action.payload.series_list
            };
        case '@@series/SET_LOADING':
            return {
                ...state,
                loading: action.payload.loading
            }
        default:
            return state;
    }
}