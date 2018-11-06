import * as React from 'react';
import { Typography, Button } from '@material-ui/core';
import { MessageSender } from 'background/messages/message-sender';
import { AccountCircle } from '@material-ui/icons';

export const NoUserView : React.SFC = (props) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'center'
        }}>
            <Typography variant='title'>
                Signed out
            </Typography>
            <Typography variant='caption'>
                You signed out, you need to sign back in to continue using VideoSyncer.
            </Typography>
            <Button
                color='primary'
                variant='contained'
                onClick={() => MessageSender.requestUserSignIn()}
                style={{
                    marginTop: '10px'
                }}
                >
                <AccountCircle style={{marginRight: '10px'}} />
                Sign back in
            </Button>
        </div>
    )
}