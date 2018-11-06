import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { Typography, Button, colors, List, ListItem, ListItemText, ListItemSecondaryAction, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, CardContent, Card, CardHeader } from '@material-ui/core';
import { MessageSender } from 'background/messages/message-sender';
import { CropFreeRounded, ReplayRounded, ErrorOutlineRounded, ExpandMoreRounded } from '@material-ui/icons';

export class NoVideo extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexGrow: 1
                }}>
                    <ErrorOutlineRounded style={{
                        color: colors.red[500],
                        marginBottom: '10px',
                        height: '50px',
                        width: '50px'
                    }} />
                    <Typography variant='subheading' style={{
                        marginBottom: '10px'
                    }}>
                        We could not find a video
                    </Typography>
                    {
                        this.props.videoRequestCounter !== -1 &&
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Button 
                                    variant='contained'
                                    color='primary'
                                    size='small'
                                    onClick={() => {
                                        this.props.requestCounterShortening()
                                    }}
                                    disabled={this.props.videoRequestCounter <= 0}
                                >
                                <ReplayRounded style={{marginRight: '10px'}} />
                                {
                                    this.props.videoRequestCounter <= 0 ? 'Retrying...' : `Retrying in ${this.props.videoRequestCounter} seconds...`
                                }
                            </Button>
                        </div>
                    }
                </div>
                <div style={{
                    flexGrow: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Card>
                        <CardHeader title='Help us find your video' />
                        <CardContent>
                            <ExpansionPanel>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreRounded />}>
                                    <Typography>The video is not loaded</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Typography variant='caption'>
                                        Simply start the video to ensure that the video element is actually loaded.
                                    </Typography>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            <ExpansionPanel>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreRounded />}>
                                    <Typography>The video is not loaded</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Typography variant='caption'>
                                        Simply start the video to ensure that the video element is actually loaded.
                                    </Typography>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        </CardContent>
                    </Card>

                        {/* {
                            this.props.series.videoPlayerHost &&
                            <ListItem>
                                <ListItemText primary='Remove restrictions' secondary={this.props.series.videoPlayerHost} />
                                <ListItemSecondaryAction>
                                    <Button 
                                        variant='contained'
                                        size='small'
                                        color='secondary'
                                        onClick={() => {
                                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                                videoPlayerHost: null
                                            })
                                        }}
                                    >
                                        <CropFreeRounded style={{marginRight: '10px'}} />
                                        Remove Restriction
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        } */}
                </div>
            </div>
        )
    }
}