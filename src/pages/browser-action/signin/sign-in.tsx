import * as React from 'react';

import { Typography, Button } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { MessageSender } from 'background/messages/message-sender';

export const SignIn: React.SFC = (props) => {
    return (
        <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
            <Typography variant='display2'>Uh oh</Typography>
            <Typography variant='headline'>It looks like you're not signed in</Typography>
            <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}} onClick={MessageSender.requestUserSignIn}>
                <AccountCircle style={{marginRight: '10px'}} />
                Sign in
            </Button>
        </div>
    )
}