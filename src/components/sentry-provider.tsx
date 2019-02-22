import * as React from 'react';
import * as Sentry from '@sentry/browser';
import { Typography, Card, Button, colors, Dialog, DialogTitle } from '@material-ui/core';

type SentryProviderState = {
    error: Error,
    modalVisible: boolean
}

export class SentryProvider extends React.Component<any, SentryProviderState> {
    constructor(props) {
        super(props);
        this.state = { error: null, modalVisible: false };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error: ', error);
        this.setState({ error });
        Sentry.withScope(scope => {
            Object.keys(errorInfo).forEach(key => {
                scope.setExtra(key, errorInfo[key]);
            });
            Sentry.captureException(error);
        });
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                    <Typography variant='headline' style={{
                        marginBottom: '10px'
                    }}>
                        Something went wrong
                    </Typography>
                    <Button variant='contained' color='primary' onClick={() => Sentry.showReportDialog()} style={{marginBottom: '10px', textTransform: 'none'}}>
                        Tell us what happened
                    </Button>
                    <Typography variant='body2' color='secondary' style={{ cursor: 'pointer' }} onClick={() => {
                        this.setState({ modalVisible: true });
                    }}>
                        Show error details
                    </Typography>
                    <Dialog open={this.state.modalVisible} onClose={() => this.setState({ modalVisible: false })}>
                        <DialogTitle>{this.state.error.name} [{this.state.error.message}]</DialogTitle>
                        <div>
                            {JSON.stringify(this.state.error.stack)}
                        </div>
                    </Dialog>
                </div>
            );
        } else {
            return this.props.children;
        }
    }
}