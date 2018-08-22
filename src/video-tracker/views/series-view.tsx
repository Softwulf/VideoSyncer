import * as React from 'react';
import { Typography, Button, LinearProgress, Paper, Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import { browser } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';
import { bind } from 'bind-decorator';
import { TopDownMessenger } from '../messaging/top-messages';
import { BottomUpMessageUnion } from '../messaging/frame-messages';
import * as equal from 'fast-deep-equal';
import { MessageSender } from 'background/messages/message-sender';
import { ElementSelection } from '../messaging/selection';

export type SeriesViewProps = {
    series: VSync.Series
}

type SeriesViewState = {
    videoFrame?: string
    searchingFor?: ElementSelection
    autoplayCountdown?: number
    autoplayDone?: boolean
}

const COUNTDOWN_LENGTH = 10;

export class SeriesView extends React.Component<SeriesViewProps, SeriesViewState> {
    messenger = new TopDownMessenger();

    videoRequestInterval: any
    autoplayInterval: any

    constructor(props) {
        super(props);
        this.state = {
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
                        if(this.props.series.autoplay && !this.state.autoplayDone) {
                            this.messenger.setPaused(this.state.videoFrame, true);
                            this.messenger.setFullscreen(this.state.videoFrame, false);
                            this.startAutoplay();
                        }
                        break;
                    case '@@top/SELECTION_CONFIRMED':
                        this.setState({
                            searchingFor: undefined
                        })
                        this.messenger.stopSelection()
                        if(data.selection === 'videoPlayerHost') {
                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                videoPlayerHost: data.host
                            });
                        } else {
                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                [data.selection]: {
                                    host: data.host,
                                    query: data.query
                                }
                            });
                        }
                        window.alert(`${data.selection} selected`);
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
        this.messenger.stopSelection();
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

    @bind
    requestSelection(selection: ElementSelection) {
        this.setState({
            searchingFor: selection
        })
        this.messenger.requestSelection(selection);
        window.alert('Click on the '+selection);
    }

    @bind
    stopSelection() {
        this.setState({
            searchingFor: undefined
        })
        this.messenger.stopSelection();
        window.alert('Selection stopped');
    }

    @bind
    startAutoplay() {
        if(!this.props.series.nextButton) {
            window.alert('No next button defined, cannot autoplay');
            this.stopAutoplay();
            return;
        }

        if(!this.state.autoplayCountdown) {
            this.setState({
                autoplayCountdown: COUNTDOWN_LENGTH
            });
            if(this.autoplayInterval) clearInterval(this.autoplayInterval);
            this.autoplayInterval = setInterval(() => {
                this.setState({
                    autoplayCountdown: this.state.autoplayCountdown-1
                });
                if(this.state.autoplayCountdown <= 0) {
                    this.playNext();
                }
            }, 1000);
        }
    }

    @bind
    stopAutoplay() {
        if(this.autoplayInterval) clearInterval(this.autoplayInterval);
        this.setState({
            autoplayCountdown: undefined,
            autoplayDone: true
        })
    }

    @bind
    playNext() {
        this.stopAutoplay();
        if(!this.props.series.nextButton) {
            window.alert('No nextbutton defined!');
            return;
        }
        window.alert('Neeeext');
        this.messenger.requestClick(this.props.series.nextButton);
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
                        <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => {
                                this.requestSelection('nextButton')
                            }}>
                            S Next
                        </Button>
                        <Button
                            variant='contained'
                            color='secondary'
                            onClick={() => {
                                this.requestSelection('videoPlayerHost')
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

                {
                    this.state.searchingFor &&
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-around'
                        }}>
                            <Button
                                color='secondary'
                                variant='extendedFab'
                                onClick={() => {
                                    this.stopSelection()
                                }}
                                >
                                Cancel Search
                            </Button>
                        </div>
                }
                <div>
                <Dialog onClose={this.stopAutoplay} open={this.state.autoplayCountdown !== undefined}>
                    <DialogTitle>Autoplay in {this.state.autoplayCountdown} seconds</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.playNext} color='secondary'>
                            Skip
                        </Button>
                        <Button onClick={this.stopAutoplay} color='primary' autoFocus>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                </div>
            </div>
        )
    }
}