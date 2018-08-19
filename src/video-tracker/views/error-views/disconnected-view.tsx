import * as React from 'react';
import { Typography, Button } from '@material-ui/core';

export const DisconnectedView: React.SFC = (props) => {
    return (
        <div>
            <Typography variant='title'>
                Disconnected, please refresh Tab
                <Button color='secondary' variant='contained' onClick={() => window.location.reload()} style={{ marginLeft: '10px' }}>
                    Refresh
                </Button>
            </Typography>
        </div>
    )
}