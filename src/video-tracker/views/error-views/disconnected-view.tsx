import * as React from 'react';
import { Typography, Button } from '@material-ui/core';
import { RefreshRounded } from '@material-ui/icons';

export const DisconnectedView: React.SFC = (props) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center'
        }}>
            <Typography variant='title'>
                Connection lost
            </Typography>
            <Typography variant='caption'>
                We lost connection to the VideoSyncer extension, please refresh the page.
            </Typography>
            <Button
                color='primary'
                variant='contained'
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '10px'
                }}
                >
                <RefreshRounded style={{marginRight: '10px'}} />
                Refresh
            </Button>
        </div>
    )
}