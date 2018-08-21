import * as React from 'react';
import { Typography, Button } from '@material-ui/core';
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

        this.videoRequestInterval = setInterval(() => {
            this.messenger.requestVideo();
        }, 1000);
    }

    componentWillUnmount() {
        debug('[UNMOUNT] Removing Series from Frames');
        this.messenger.setSeries(undefined);

        if(this.videoRequestInterval) clearInterval(this.videoRequestInterval);
        window.removeEventListener('message', this.handleMessage);
    }

    componentWillReceiveProps(newProps: SeriesViewProps) {
        if(!equal(this.props.series, newProps.series)) {
            debug('[PROPS] Sending Updated Series to Frames');
            this.messenger.setSeries(newProps.series);

            if(newProps.series.latestFrame !== this.state.videoFrame) {
                this.messenger.setPaused(this.state.videoFrame, true);
                this.messenger.setTime(this.state.videoFrame, newProps.series.currentTime);
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
                        if(this.videoRequestInterval) clearInterval(this.videoRequestInterval);

                        if(this.state.videoFrame) break;
                        this.messenger.confirmVideo(data.frameId);

                        this.setState({
                            videoFrame: data.frameId
                        });

                        const extractedPath = window.location.pathname.slice(('/'+this.props.series.pathbase).length);
                        debug(extractedPath, this.props.series.currentPath);
                        const isNewEpisode = this.props.series.currentPath !== extractedPath
                        if(isNewEpisode) {
                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                currentPath: extractedPath,
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

    render() {
        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'space-around',
                alignItems: 'center'
            }}
            >
                <Typography variant='title'>
                    {this.props.series.name} - Ended: {this.state.ended ? 'Yes' : 'No'}
                </Typography>
                <Button variant='contained' color='secondary' onClick={() => this.messenger.setFullscreen(this.state.videoFrame, true)}>
                    FS
                </Button>
                <Typography variant='caption'>
                    {
                        this.state.videoFrame === this.props.series.latestFrame ? 'Active' : 'Inactive'
                    }
                </Typography>
                <Typography variant='caption'>
                    {
                        this.state.videoFrame ? this.state.videoFrame : 'No Video found'
                    }
                </Typography>
            </div>
        )
    }
}