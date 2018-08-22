import * as React from 'react';
import { Button } from '@material-ui/core';
import { SeriesViewProps } from './series-manager';

export class VideoSelector extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '10px'
            }}>
                <Button
                    color='primary'
                    variant='contained'
                    onClick={() => {
                        this.props.requestSelection('videoPlayerHost')
                    }}
                    >
                    Restrict Video Player
                </Button>
                <Button
                    color='secondary'
                    variant='contained'
                    onClick={() => {
                        this.props.requestSelection('nextButton')
                    }}
                    >
                    Select Next Button
                </Button>
            </div>
        )
    }
}