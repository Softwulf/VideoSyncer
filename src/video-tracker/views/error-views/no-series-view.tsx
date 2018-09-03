import * as React from 'react';
import { Typography } from '@material-ui/core';

export const NoSeriesView : React.SFC = (props) => {
    return (
        <div>
            <Typography variant='title'>
                No matching series found
            </Typography>
        </div>
    )
}