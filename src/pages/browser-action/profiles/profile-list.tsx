import * as React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';

export type ProfileListProps = {
    profiles: vsync.Profile[]
}

export const ProfileList: (props: ProfileListProps) => JSX.Element[] = (props) => {
    return props.profiles.map(profile => {
        return (
            <ListItem divider>
                <ListItemText primary={profile.name} secondary={profile.currentTime} />
            </ListItem>
        )   
    })
}