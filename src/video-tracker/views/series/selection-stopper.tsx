import * as React from 'react';
import { Button } from '@material-ui/core';
import { SeriesViewProps } from './series-manager';

export class SelectionStopper extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '10px'
            }}>
                <Button
                    color='secondary'
                    variant='extendedFab'
                    onClick={() => {
                        this.props.stopSelection()
                    }}
                    >
                    Cancel Search
                </Button>
            </div>
        )
    }
}