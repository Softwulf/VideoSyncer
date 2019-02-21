import * as React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import configureStore from './store';
import * as Sentry from '@sentry/browser';

const history = createMemoryHistory();
const store = configureStore(history);

history.listen(change => {
    Sentry.addBreadcrumb({
        category: 'navigation',
        level: Sentry.Severity.Info,
        message: `Navigated to ${change.pathname}`
    });
});

export class ReduxProvider extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    {this.props.children}
                </ConnectedRouter>
            </Provider>
        )
    }
}