import { Action } from "redux";

export interface RequestCloseTab extends Action {
    type: '@@request/CLOSE_TAB';
}

export interface RequestUserSignOut extends Action {
    type: '@@request/SIGN_OUT';
}

export interface RequestUserSignIn extends Action {
    type: '@@request/SIGN_IN';
}

export interface RequestSeriesCreate extends Action {
    type: '@@request/SERIES_CREATE';
    payload: {
        series: VSync.SeriesBase
    }
}

export interface RequestSeriesEdit extends Action {
    type: '@@request/SERIES_EDIT';
    payload: {
        series: VSync.Series
    }
}

export interface RequestSeriesDelete extends Action {
    type: '@@request/SERIES_DELETE';
    payload: {
        seriesId: string
    }
}

export type RequestActions =        RequestCloseTab
                                |   RequestUserSignOut
                                |   RequestUserSignIn
                                |   RequestSeriesCreate
                                |   RequestSeriesEdit
                                |   RequestSeriesDelete