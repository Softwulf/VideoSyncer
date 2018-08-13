import * as React from 'react';

import { Typography, Button } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { AuthCore } from 'auth/wulf-auth';

export const SignIn: React.SFC = (props) => {
    return (
        <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
            <Typography variant='display2'>Uh oh</Typography>
            <Typography variant='headline'>Looks like you're not signed in</Typography>
            <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}} onClick={AuthCore.login}>
                <AccountCircle style={{marginRight: '10px'}} />
                Sign in
            </Button>
        </div>
    )
}