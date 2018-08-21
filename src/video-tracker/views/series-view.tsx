import * as React from 'react';
import { Typography, Button, LinearProgress } from '@material-ui/core';
import { browser } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';
import { bind } from 'bind-decorator';
import { TopDownMessenger } from '../messaging/top-messages';
import { BottomUpMessageUnion } from '../messaging/frame-messages';
import * as equal from 'fast-deep-equal';
import { MessageSender } from 'background/messages/message-sender';

export type SeriesViewProps = {
    series: VSync.Series
}

type SeriesViewState = {
    videoFrame?: string
    ended: boolean
}

export class SeriesView extends React.Component<SeriesViewProps, SeriesViewState> {
    messenger = new TopDownMessenger();

    videoRequestInterval: any

    constructor(props) {
        super(props);
        this.state = {
            ended: false
        }
    }

    componentDidMount() {
        debug('[MOUNT] Sending Series to Frames');
        this.messenger.setSeries(this.props.series);

        window.addEventListener('message', this.handleMessage);

        this.requestVideo();
    }

    componentWillUnmount() {
        debug('[UNMOUNT] Removing Series from Frames');
        this.messenger.setSeries(undefined);
        window.removeEventListener('message', this.handleMessage);

        this.removeVideo();

        this.clearVideoRequest();
    }

    componentWillReceiveProps(newProps: SeriesViewProps) {
        if(!equal(this.props.series, newProps.series)) {
            debug('[PROPS] Sending Updated Series to Frames');
            this.messenger.setSeries(newProps.series);

            // another frame is playing, pause this frame
            if(newProps.series.latestFrame !== this.state.videoFrame) {
                this.messenger.setPaused(this.state.videoFrame, true);
                this.messenger.setTime(this.state.videoFrame, newProps.series.currentTime);
            }

            // another frame started a new episode
            if(newProps.series.currentPath !== this.getCurrentPath()) {
                this.removeVideo();

                // TODO: let user decide which episode should be used
            }
        }
    }

    @bind
    handleMessage(msg: MessageEvent) {
        if(msg.data) {
            const data: BottomUpMessageUnion = msg.data;
            if(data.type && data.type === '@@topmessage') {
                debug('Top msg received: ', data.subtype);
                switch(data.subtype) {
                    case '@@top/VIDEO_FOUND':
                        this.clearVideoRequest();
                        if(this.state.videoFrame) return; // if we already have a video player, break

                        this.messenger.confirmVideo(data.frameId);

                        this.setState({
                            videoFrame: data.frameId
                        });


                        const currentPath = this.getCurrentPath();
                        if(currentPath !== this.props.series.currentPath) { // New Episode
                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                currentPath: currentPath,
                                latestFrame: data.frameId
                            });
                            this.messenger.setTime(data.frameId, this.props.series.startTime);
                        } else {
                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                latestFrame: data.frameId
                            });
                            this.messenger.setTime(data.frameId, this.props.series.currentTime);
                        }

                        break;
                    case '@@top/VIDEO_ENDED':
                        this.messenger.setPaused(this.state.videoFrame, true);
                        this.messenger.setFullscreen(this.state.videoFrame, false);
                        this.setState({
                            ended: true
                        })
                        break;
                }
            }
        }
    }

    @bind
    getCurrentPath() {
        return window.location.pathname.slice(('/'+this.props.series.pathbase).length);
    }

    @bind
    requestVideo() {
        if(!this.videoRequestInterval) {
            this.videoRequestInterval = setInterval(() => {
                this.messenger.requestVideo();
            }, 1000);
        }
    }

    @bind
    removeVideo() {
        this.messenger.setPaused(this.state.videoFrame, true);
        this.messenger.setFullscreen(this.state.videoFrame, false);
        this.messenger.removeVideo(this.state.videoFrame);
        this.setState({
            videoFrame: undefined
        })
    }

    @bind
    clearVideoRequest() {
        if(this.videoRequestInterval) clearInterval(this.videoRequestInterval);
    }

    render() {
        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'stretch'
            }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around'
                }}>
                    <Typography variant='title'>
                        {this.props.series.name}
                    </Typography>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around'
                }}>
                    <Typography variant='caption'>
                        {
                            this.state.videoFrame ? this.state.videoFrame : 'No Video found'
                        }
                    </Typography>
                    <Typography variant='caption'>
                        {
                            this.state.videoFrame === this.props.series.latestFrame ? 'Active' : 'Inactive'
                        }
                    </Typography>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: '10px'
                }}>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            this.messenger.setFullscreen(this.state.videoFrame, true)
                        }}>
                        Full
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            this.messenger.setPaused(this.state.videoFrame, false)
                        }}>
                        Play
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            this.messenger.setPaused(this.state.videoFrame, true)
                        }}>
                        Pause
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            this.messenger.setTime(this.state.videoFrame, this.props.series.currentTime-30)
                        }}>
                        -30
                    </Button>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            this.messenger.setTime(this.state.videoFrame, this.props.series.currentTime+30)
                        }}>
                        +30
                    </Button>
                </div>
                <LinearProgress color="secondary" variant="determinate" value={(100 / this.props.series.currentMaxTime) * this.props.series.currentTime} />
            </div>
        )
    }
}