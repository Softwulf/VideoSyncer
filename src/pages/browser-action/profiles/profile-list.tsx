import * as React from 'react';
import { ListItem, ListItemText, Typography, Button, List, ListSubheader } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom';

export type ProfileListProps = {
    profiles: vsync.Profile[]
}

export const ProfileList: React.SFC<ProfileListProps> = (props: ProfileListProps) => {
    if(props.profiles.length === 0) {
        return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                <Typography variant='headline'>Get started by creating a profile</Typography>
                <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}} component={(props) => <Link to='new' {...props as any} />}>
                    <AddCircle style={{marginRight: '10px'}} />
                    Create your first profile
                </Button>
            </div>
        )
    }

    const list = props.profiles.map(profile => {
        return (
            <ListItem divider key={profile.key}>
                <ListItemText primary={profile.name} secondary={profile.currentTime} />
            </ListItem>
        )   
    });
    return (
        <List subheader={<ListSubheader disableSticky>Profiles</ListSubheader>} style={{flexGrow: 1}}>
            {list}
        </List>
    )
}