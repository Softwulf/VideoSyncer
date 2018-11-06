import * as React from 'react';
import { Typography } from '@material-ui/core';

export const NoSeriesView : React.SFC = (props) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center'
        }}>
            <Typography variant='title'>
                Series not found
            </Typography>
            <Typography variant='caption'>
                We found no series matching with this page.
            </Typography>
        </div>
    )
}