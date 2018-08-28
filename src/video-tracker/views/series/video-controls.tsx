import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { LinearProgress, Button, Paper, IconButton, Badge, Typography } from '@material-ui/core';
import { TopDownMessenger } from '../../messaging/top-messages';
import { SeriesProgress } from 'components/series-progress';

import { FullscreenRounded, PlayArrowRounded, PauseRounded, SkipNextRounded, SkipPreviousRounded } from '@material-ui/icons';
import { secondsToHms } from 'vutil';

export class VideoControls extends React.Component<SeriesViewProps, {}> {
    messenger = new TopDownMessenger();

    render() {
        return (
            <Paper elevation={2}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '10px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                    }}>
                        <IconButton
                            onClick={() => {
                                this.messenger.setPaused(this.props.videoFrame, false)
                            }}>
                            <PlayArrowRounded
                                style={{
                                    margin: 0
                                }}
                            />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                this.messenger.setPaused(this.props.videoFrame, true)
                            }}>
                            <PauseRounded
                                style={{
                                    margin: 0
                                }}
                            />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                this.messenger.setTime(this.props.videoFrame, this.props.series.currentTime-30)
                            }}>
                            <SkipPreviousRounded
                                style={{
                                    margin: 0
                                }}
                            />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                this.messenger.setTime(this.props.videoFrame, this.props.series.currentTime+30)
                            }}>
                            <SkipNextRounded
                                style={{
                                    margin: 0
                                }}
                            />
                        </IconButton>
                    </div>
                    <Typography
                        variant='caption'
                        style={{
                            flexGrow: 1,
                            textAlign: 'center'
                        }}
                        >
                        {secondsToHms(this.props.series.currentTime, true)}
                    </Typography>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>
                        <IconButton
                            onClick={() => {
                                this.messenger.setFullscreen(this.props.videoFrame, true)
                            }}>
                            <FullscreenRounded
                                style={{
                                    margin: 0
                                }}
                            />
                        </IconButton>
                    </div>
                </div>
                <SeriesProgress series={this.props.series} style={{
                    marginTop: '5px'
                }} />
            </Paper>
        )
    }
}