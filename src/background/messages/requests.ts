import { Action } from 'redux';

export interface RequestScriptInjection extends Action {
    type: '@@request/INJECT_SCRIPT';
    payload: {
        script: 'INJECTORS' | 'FRAME'
    }
}

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
        series: Partial<VSync.Series>
        key: VSync.Series['key']
    }
}

export interface RequestSeriesDelete extends Action {
    type: '@@request/SERIES_DELETE';
    payload: {
        seriesId: string
    }
}

export interface RequestSettingsUpdate extends Action {
    type: '@@request/SETTINGS_UPDATE';
    payload: {
        settings: Partial<VSync.Settings>
    }
}

export type RequestActions =        RequestCloseTab
                                |   RequestUserSignOut
                                |   RequestUserSignIn
                                |   RequestSeriesCreate
                                |   RequestSeriesEdit
                                |   RequestSeriesDelete
                                |   RequestSettingsUpdate
                                |   RequestScriptInjection