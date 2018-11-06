import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { Typography, Button, colors, List, ListItem, ListItemText, ListItemSecondaryAction, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, CardContent, Card, CardHeader, Grid, ExpansionPanelActions } from '@material-ui/core';
import { MessageSender } from 'background/messages/message-sender';
import { CropFreeRounded, ReplayRounded, ErrorOutlineRounded, ExpandMoreRounded } from '@material-ui/icons';

export class NoVideo extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <Grid container spacing={40}>
                <Grid item xs={12} md={4}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
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
                                    <Button 
                                            variant='contained'
                                            color='primary'
                                            size='small'
                                            onClick={() => {
                                                this.props.requestCounterShortening()
                                            }}
                                            disabled={this.props.videoRequestCounter <= 0}
                                            style={{ width: '100%' }}
                                        >
                                        <ReplayRounded style={{marginRight: '10px'}} />
                                        {
                                            this.props.videoRequestCounter <= 0 ? 'Retrying ...' : `Retrying in ${this.props.videoRequestCounter} seconds...`
                                        }
                                    </Button>
                            }
                        </div>
                    </div>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader title='Help us find your video' />
                        <CardContent>
                            <ExpansionPanel>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreRounded />}>
                                    <Typography>The video might not be loaded</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Typography variant='caption'>
                                        Some websites only load the real video once you start the playback, so simply try starting the video.
                                    </Typography>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            {
                                this.props.series.videoPlayerHost &&
                                <ExpansionPanel>
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreRounded />}>
                                        <Typography>Videos are restricted to <b>{this.props.series.videoPlayerHost}</b></Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                        <Typography variant='caption'>
                                            You told us only to accept videos from <b>{this.props.series.videoPlayerHost}</b>. If the website changed and the video no longer is from that source you can remove the restriction.
                                        </Typography>
                                    </ExpansionPanelDetails>
                                    <ExpansionPanelActions>
                                        <Button size='small' color='secondary' onClick={() => {
                                            MessageSender.requestSeriesEdit(this.props.series.key, {
                                                videoPlayerHost: null
                                            })
                                        }}>
                                            Remove Restrictions
                                        </Button>
                                    </ExpansionPanelActions>
                            </ExpansionPanel>
                            }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        )
    }
}