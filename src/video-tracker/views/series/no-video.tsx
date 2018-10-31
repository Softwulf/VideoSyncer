import * as React from 'react';
import { SeriesViewProps } from './series-manager';
import { Typography, Button, colors, List, ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { MessageSender } from 'background/messages/message-sender';
import { CropFreeRounded, ReplayRounded, ErrorOutlineRounded } from '@material-ui/icons';

export class NoVideo extends React.Component<SeriesViewProps, {}> {
    render() {
        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
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
                <div>
                    <Typography variant='subheading'>
                        If we cannot find your video, try following these tips
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText primary='Lorem Ipsum' />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary='Lorem Ipsum' />
                        </ListItem>
                        {
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
                        }
                    </List>
                </div>
            </div>
        )
    }
}