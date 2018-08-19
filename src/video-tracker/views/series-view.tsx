import * as React from 'react';
import { Typography } from '@material-ui/core';

export type SeriesViewProps = {
    series: VSync.Series
}

export class SeriesView extends React.Component<SeriesViewProps, {}> {

    componentWillUnmount() {
        console.debug('Unmount');
    }

    render() {
        return (
            <Typography variant='title'>
                {this.props.series.name}
            </Typography>
        )
    }
}