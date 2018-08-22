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
                Disconnected, please refresh Tab
            </Typography>
            <Button
                color='secondary'
                variant='extendedFab'
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