import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { Dialog, DialogTitle, DialogActions, Button, colors, DialogContent } from '@material-ui/core';

export class AutoplayComponent extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <Dialog onClose={this.props.stopAutoplay} open={this.props.autoplayCountdown !== undefined}>
                <DialogTitle>Autoplay in {this.props.autoplayCountdown} seconds</DialogTitle>
                <DialogContent style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'stretch'
                }}>
                    <Button
                        onClick={this.props.playNext}
                        style={{
                            backgroundColor: colors.green[500],
                            color: '#FFF'
                        }}
                        variant='contained'
                        >
                        Play Now
                    </Button>
                    <Button
                        onClick={this.props.stopAutoplay}
                        style={{
                            marginTop: '5px'
                        }}
                        variant='text'
                    >
                        Cancel
                    </Button>
                </DialogContent>
            </Dialog>
        )
    }
}