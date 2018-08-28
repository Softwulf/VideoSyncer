import * as React from 'react';
import { Button, Collapse } from '@material-ui/core';
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
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={() => {
                                this.props.requestSelection('videoPlayerHost')
                            }}
                            >
                            S Video
                        </Button>
                        <Button
                            color='secondary'
                            variant='contained'
                            onClick={() => {
                                this.props.requestSelection('nextButton')
                            }}
                            >
                            S Next
                        </Button>
                    </div>
                </Collapse>

            </div>
        //     <div
        //             style={{
        //                 display: 'flex',
        //                 justifyContent: 'center',
        //                 alignItems: 'center',
        //                 padding: '20px'
        //             }}
        //         >
        //     <Collapse
        //         in={this.state.expanded}
        //         >
                
        //             <div style={{
        //                 display: 'flex',
        //                 justifyContent: 'space-around',
        //                 marginTop: '10px'
        //             }}>
                        // <Button
                        //     color='primary'
                        //     variant='contained'
                        //     onClick={() => {
                        //         this.props.requestSelection('videoPlayerHost')
                        //     }}
                        //     >
                        //     Restrict Video Player
                        // </Button>
                        // <Button
                        //     color='secondary'
                        //     variant='contained'
                        //     onClick={() => {
                        //         this.props.requestSelection('nextButton')
                        //     }}
                        //     >
                        //     Select Next Button
                        // </Button>
        //             </div>
        //         </div>
        // </Collapse>
        // </div>
        )
    }
}