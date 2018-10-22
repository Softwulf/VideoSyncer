import * as React from 'react';
import { ElementSelection } from '../../messaging/selection';
import { TopDownMessenger } from '../../messaging/top-messages';
import { debug } from 'vlogger';
import * as equal from 'fast-deep-equal';
import { bind } from 'bind-decorator';
import { BottomUpMessageUnion } from '../../messaging/frame-messages';
import { MessageSender } from 'background/messages/message-sender';
import { Typography } from '@material-ui/core';
import { VideoDisplay } from './video-display';
import { NoVideo } from './no-video';
import { SelectionStopper } from './selection-stopper';

export type SeriesManagerProps = {
    series: VSync.Series
}

export type SeriesManagerState = {
    videoFrame?: string
    searchingFor?: ElementSelection
    autoplayCountdown?: number
    autoplayDone?: boolean
    onlyOneAutoplay?: boolean
    videoRequestDelay: number
    videoRequestCounter: number
}

export type SeriesViewProps = SeriesManagerProps & SeriesManagerState & {
    currentPath: string
    requestSelection: (selection: ElementSelection) => any
    stopSelection: () => any
    startAutoplay: () => any
    stopAutoplay: () => any
    playNext: () => any
    requestVideoWithoutIncrease: () => any
}

const COUNTDOWN_LENGTH = 10;
const REQUEST_TIMEOUT_INIT = 3;
const REQUEST_TIMEOUT_FACTOR = 1.5;
const REQUEST_TIMEOUT_MAX = 30;

export class SeriesManager extends React.Component<SeriesManagerProps, SeriesManagerState> {
    messenger = new TopDownMessenger();

    videoRequestInterval: any
    autoplayInterval: any
    
    constructor(props) {
        super(props);
        this.state = {
            videoRequestDelay: REQUEST_TIMEOUT_INIT,
            videoRequestCounter: -1
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
                            videoFrame: data.frameId,
                            videoRequestDelay: REQUEST_TIMEOUT_INIT
                        });

                        const currentPath = this.getCurrentPath();
                        if(currentPath !== this.props.series.currentPath) { // New Episode
                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                currentPath: currentPath,
                                latestFrame: data.frameId,
                                currentTime: this.props.series.startTime
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
                            this.startAutoplay(true);
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

    componentWillReceiveProps(newProps: SeriesManagerProps) {
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
    getCurrentPath() {
        return window.location.pathname.slice(('/'+this.props.series.pathbase).length);
    }

    @bind
    clearVideoRequest() {
        if(this.videoRequestInterval) clearInterval(this.videoRequestInterval);
        this.setState({
            videoRequestCounter: -1,
            videoRequestDelay: REQUEST_TIMEOUT_INIT
        })
    }

    @bind
    requestVideo() {
        if(!this.videoRequestInterval) {
            setInterval(() => {
                const countdown = this.state.videoRequestCounter;
                if(countdown <= 0) {
                    this.messenger.requestVideo();
                    let newDelay = Math.floor(this.state.videoRequestDelay * REQUEST_TIMEOUT_FACTOR);
                    if(newDelay > REQUEST_TIMEOUT_MAX) newDelay = REQUEST_TIMEOUT_MAX;
                    this.setState({
                        videoRequestCounter: newDelay,
                        videoRequestDelay: newDelay
                    });
                } else {
                    this.setState({
                        videoRequestCounter: this.state.videoRequestCounter - 1
                    })
                }
            }, 1000);
        }
    }

    @bind
    requestVideoWithoutIncrease() {
        this.messenger.requestVideo();
        this.setState({
            videoRequestCounter: this.state.videoRequestDelay
        })
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
    }

    @bind
    startAutoplay(onceOnly?: boolean) {
        this.setState({
            onlyOneAutoplay: true
        })
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
        const obj: Partial<SeriesManagerState> = {
            autoplayCountdown: undefined
        }
        if(this.state.onlyOneAutoplay) {
            obj.autoplayDone = true;
        }
        this.setState({...obj, videoRequestDelay: this.state.videoRequestDelay, videoRequestCounter: this.state.videoRequestCounter});
    }

    @bind
    playNext() {
        this.stopAutoplay();
        if(!this.props.series.nextButton) {
            window.alert('No nextbutton defined!');
            return;
        }
        this.messenger.requestClick(this.props.series.nextButton);
    }

    render() {
        const seriesViewProps: SeriesViewProps = {
            ...this.state,
            series: this.props.series,
            currentPath: this.getCurrentPath(),
            requestSelection: this.requestSelection,
            stopSelection: this.stopSelection,
            startAutoplay: this.startAutoplay,
            stopAutoplay: this.stopAutoplay,
            playNext: this.playNext,
            requestVideoWithoutIncrease: this.requestVideoWithoutIncrease
        }

        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch'
            }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginBottom: '10px'
                }}>
                    <Typography variant='title'>
                        {this.props.series.name}
                    </Typography>
                </div>

                {
                    this.state.videoFrame ?
                        <VideoDisplay {...seriesViewProps} />
                    :
                        <NoVideo {...seriesViewProps} />
                }

                {
                    this.state.searchingFor && <SelectionStopper {...seriesViewProps} />
                }

            </div>
        )
    }
}