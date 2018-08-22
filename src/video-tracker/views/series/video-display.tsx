import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { AutoplayComponent } from './autoplay';
import { VideoControls } from './video-controls';
import { VideoSelector } from './video-selector';

export class VideoDisplay extends React.Component<SeriesViewProps, {}> {
    render() {
        const activeTab = this.props.series.latestFrame === this.props.videoFrame;
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                flexDirection: 'column'
            }}>
                Video found :)
                {
                    activeTab ? 'Aaaactive' : 'Not active'
                }
                <VideoControls {...this.props} />
                <VideoSelector {...this.props} />

                <AutoplayComponent {...this.props} />
            </div>
        )
    }
}