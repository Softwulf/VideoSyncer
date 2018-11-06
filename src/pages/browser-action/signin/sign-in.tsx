import * as React from 'react';

import { Typography, Button } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { MessageSender } from 'background/messages/message-sender';

export const SignIn: React.SFC = (props) => {
    return (
        <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
            <Typography variant='display2'>Series</Typography>
            <Typography variant='subheading'>Your series will display here.</Typography>
            <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}} onClick={MessageSender.requestUserSignIn}>
                <AccountCircle style={{marginRight: '10px'}} />
                Get Started
            </Button>
        </div>
    )
}