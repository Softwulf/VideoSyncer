import { RouterState, connectRouter } from "connected-react-router";
import { UserState } from "./users/types";
import { combineReducers, Reducer, Dispatch, Action } from "redux";
import { History } from "history";
import { UserReducer } from "./users/reducers";
import { ThemeState } from "./themes/types";
import { ThemeReducer } from "./themes/reducers";
import { SeriesState } from "./series/types";
import { SeriesReducer } from "./series/reducers";

export interface ApplicationState {
    theme: ThemeState
    router: RouterState
    user: UserState
    series: SeriesState
}

export const rootReducer: (history: History) => Reducer<ApplicationState> = (history) => {
    let combinedReducers = combineReducers({
        user: UserReducer,
        theme: ThemeReducer,
        series: SeriesReducer
    });
    return (connectRouter(history)(combinedReducers) as Reducer<ApplicationState>);
};

export interface HasDispatch {
    dispatch: Dispatch<Action<any>>;
}

export const mapDispatch = (dispatch: Dispatch): HasDispatch => {
    return {
        dispatch
    }
}

export interface HasRouter {
    router: RouterState
}

export const mapRouter = (state: ApplicationState): HasRouter => {
    return {
        router: state.router
    }
}