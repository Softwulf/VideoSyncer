import * as React from 'react';
import { Button, Collapse, Tooltip } from '@material-ui/core';
import { SeriesViewProps } from './series-manager';

type VideoSelectorState = {
    expanded: boolean
}

export class VideoSelector extends React.Component<SeriesViewProps, VideoSelectorState> {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        }
    }
    render() {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '10px'
            }}>
                <Button
                    variant='text'
                    color='secondary'
                    onClick={() => {
                        this.setState({
                            expanded: !this.state.expanded
                        })
                    }}
                    >
                    {
                        this.state.expanded ? 'Hide advanced settings' : 'Show advanced settings'
                    }
                </Button>
                <Collapse
                    in={this.state.expanded}
                    >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around'
                    }}>
                        <Tooltip title='If VideoSyncer tracks the wrong video player, use this to specify which video player should be tracked'>
                            <Button
                                color='primary'
                                variant='contained'
                                onClick={() => {
                                    this.props.requestSelection('videoPlayerHost')
                                }}
                                >
                                Specify Video Player
                            </Button>
                        </Tooltip>
                        <Tooltip title='In order to use the autoplay feature VideoSyncer needs to know which button leads to the next episode'>
                            <Button
                                color='secondary'
                                variant='contained'
                                onClick={() => {
                                    this.props.requestSelection('nextButton')
                                }}
                                >
                                Locate Next Button
                            </Button>
                        </Tooltip>
                    </div>
                </Collapse>

            </div>
        )
    }
}