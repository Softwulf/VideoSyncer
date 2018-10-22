import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { Typography, Button } from '@material-ui/core';
import { MessageSender } from 'background/messages/message-sender';
import { CropFreeRounded, ReplayRounded } from '@material-ui/icons';

export class NoVideo extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                flexDirection: 'column',
                textAlign: 'center'
            }}>
                <Typography variant='subheading'>
                    VideoSyncer could not find a video player. Some video players only appear after you click on them, so try starting the video.
                </Typography>
                {
                    this.props.videoRequestCounter !== -1 &&
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant='caption'>
                            Retrying in {this.props.videoRequestCounter} seconds
                        </Typography>
                        <Button 
                                variant='contained'
                                color='primary'
                                onClick={() => {
                                    this.props.requestVideoWithoutIncrease()
                                }}
                            >
                            <ReplayRounded style={{marginRight: '10px'}} />
                            Retry now
                        </Button>
                    </div>
                }
                {
                    this.props.series.videoPlayerHost &&
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography variant='body2'>
                                Or try removing the video player restrictions you set up
                            </Typography>
                            <Typography variant='body2'>
                                You said the video player is from <span style={{
                                    fontWeight: 'bold'
                                }}>{this.props.series.videoPlayerHost}</span>
                            </Typography>
                            <Button 
                                variant='extendedFab'
                                color='primary'
                                onClick={() => {
                                    MessageSender.requestSeriesEdit(this.props.series.key, {
                                        videoPlayerHost: null
                                    })
                                }}
                                style={{
                                    marginTop: '10px'
                                }}
                            >
                                <CropFreeRounded style={{marginRight: '10px'}} />
                                Remove Restriction
                            </Button>
                        </div>
                }
            </div>
        )
    }
}