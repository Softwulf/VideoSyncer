import { RouterState, connectRouter } from "connected-react-router";
import { UserState } from "./users/types";
import { combineReducers, Reducer, Dispatch, Action } from "redux";
import { History } from "history";
import { UserReducer } from "./users/reducers";
import { ThemeState } from "./themes/types";
import { ThemeReducer } from "./themes/reducers";
import { ProfileReducer } from "./profiles/reducers";
import { ProfileState } from "./profiles/types";

export interface ApplicationState {
    theme: ThemeState
    router: RouterState
    user: UserState
    profiles: ProfileState
}

export const rootReducer: (history: History) => Reducer<ApplicationState> = (history) => {
    let combinedReducers = combineReducers({
        user: UserReducer,
        theme: ThemeReducer,
        profiles: ProfileReducer
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