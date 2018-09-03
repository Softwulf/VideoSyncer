import { createStore, applyMiddleware, Store } from 'redux';
import { History } from 'history';
import { routerMiddleware } from 'connected-react-router'
import { rootReducer, ApplicationState } from './index';

export default function configureStore(
    history: History
): Store<ApplicationState> {
    return createStore(
        rootReducer(history),
        applyMiddleware(
            routerMiddleware(history)
        ),
    );
}