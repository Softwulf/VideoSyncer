import * as React from 'react';
import { Typography } from '@material-ui/core';

export const NoUserView : React.SFC = (props) => {
    return (
        <div>
            <Typography variant='title'>
                You are signed out
            </Typography>
        </div>
    )
}