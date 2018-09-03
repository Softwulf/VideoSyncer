import * as React from 'react';
import { CircularProgress } from '@material-ui/core';

export const LoadingView : React.SFC = (props) => {
    return (
        <CircularProgress variant='indeterminate' color='primary'/>
    )
}