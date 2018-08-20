import * as React from 'react';
import { Typography, Button } from '@material-ui/core';
import { browser } from 'webextension-polyfill-ts';
import { debug } from 'vlogger';
import { bind } from 'bind-decorator';
import { TopDownMessenger } from '../messaging/top-messages';
import { BottomUpMessageUnion } from '../messaging/frame-messages';
import * as equal from 'fast-deep-equal';

export type SeriesViewProps = {
    series: VSync.Series
}

type SeriesViewState = {
    videoFrame?: string
}

export class SeriesView extends React.Component<SeriesViewProps, SeriesViewState> {
    messenger = new TopDownMessenger();

    videoRequestInterval: any

    constructor(props) {
        super(props);
        this.state = {

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
                        this.setState({
                            videoFrame: data.frameId
                        });
                        this.messenger.confirmVideo(data.frameId);
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
                    {this.props.series.name}
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