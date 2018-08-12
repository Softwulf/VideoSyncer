import * as React from 'react';
import { Typography, Theme, Button, Select } from '@material-ui/core';

export type SettingsTabProps = {
    setTheme: (theme: Theme['palette']['type']) => any
}

export class SettingsTab extends React.Component<SettingsTabProps, {}> {
    render() {
        return (
            <Typography>
                Settings
                <Button variant='contained' onClick={() => {
                                this.props.setTheme('dark')
                            }}>Dark Theme</Button>
                            <Button variant='contained' onClick={() => {
                                this.props.setTheme('light')
                            }}>Light Theme</Button>
            </Typography>
        )
    }
}