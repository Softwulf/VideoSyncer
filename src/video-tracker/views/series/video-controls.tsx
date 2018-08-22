import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { LinearProgress, Button, Paper } from '@material-ui/core';
import { TopDownMessenger } from '../../messaging/top-messages';

export class VideoControls extends React.Component<SeriesViewProps, {}> {
    messenger = new TopDownMessenger();

    render() {
        return (
            <Paper elevation={2}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '10px'
                    }}>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                this.messenger.setFullscreen(this.props.videoFrame, true)
                            }}>
                            Full
                        </Button>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                this.messenger.setPaused(this.props.videoFrame, false)
                            }}>
                            Play
                        </Button>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                this.messenger.setPaused(this.props.videoFrame, true)
                            }}>
                            Pause
                        </Button>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                this.messenger.setTime(this.props.videoFrame, this.props.series.currentTime-30)
                            }}>
                            -30
                        </Button>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={() => {
                                this.messenger.setTime(this.props.videoFrame, this.props.series.currentTime+30)
                            }}>
                            +30
                        </Button>
                        <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => {
                                this.props.requestSelection('nextButton')
                            }}>
                            S Next
                        </Button>
                        <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => {
                                this.props.requestSelection('videoPlayerHost')
                            }}>
                            S Video
                        </Button>
                    </div>
                    <LinearProgress
                        style={{
                            marginTop: '5px'
                        }}
                        color='secondary'
                        variant='determinate'
                        value={(100 / this.props.series.currentMaxTime) * this.props.series.currentTime} />
                </Paper>
        )
    }
}