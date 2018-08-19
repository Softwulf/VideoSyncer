import * as React from 'react';
import { Typography, Button } from '@material-ui/core';

export type SeriesViewProps = {
    series: VSync.Series
}

export class SeriesView extends React.Component<SeriesViewProps, {}> {

    componentWillUnmount() {
        console.debug('Unmount');
    }

    render() {
        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'space-around',
                alignItems: 'center'
            }}
            >
                <Typography variant='title'>
                    {this.props.series.name}
                </Typography>
                <Button onClick={() => {
                    // window.self.postMessage({type: 'test'}, '*');
                }}
                >
                    Msg
                </Button>
            </div>
        )
    }
}