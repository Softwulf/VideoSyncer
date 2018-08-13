import * as React from 'react';
import { Typography, Theme, Button, Select, List, ListSubheader, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Switch, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import { Palette as PaletteIcon, Bluetooth } from '@material-ui/icons';
import { ThemeConsumerProps } from 'components/theme-provider';

export type SettingsTabProps = ThemeConsumerProps

export type SettingsTabState = {
    pickerOpen: {[name: string]: boolean}
}

export class SettingsTab extends React.Component<SettingsTabProps, SettingsTabState> {

    state = {
        pickerOpen: {}
    }

    handleOpen(name: string) {
        this.setState({
            pickerOpen: {
                ...this.state.pickerOpen,
                [name]: true
            }
        })
    }

    handleClose(name: string) {
        this.setState({
            pickerOpen: {
                ...this.state.pickerOpen,
                [name]: false
            }
        })
    }

    render() {
        return (
            <List subheader={<ListSubheader>Settings</ListSubheader>} style={{flexGrow: 1}}>
                <ListItem>
                    <ListItemIcon>
                        <PaletteIcon />
                    </ListItemIcon>
                    <ListItemText primary='Theme' />
                    <ListItemSecondaryAction>
                        <Select
                            open={this.state.pickerOpen['theme']}
                            onClose={() => this.handleClose('theme')}
                            onOpen={() => this.handleOpen('theme')}
                            value={this.props.theme.palette.type}
                            onChange={(event) => this.props.setTheme(event.target.value as any)}
                        >
                            <MenuItem value={'light'}>Light</MenuItem>
                            <MenuItem value={'dark'}>Dark</MenuItem>
                        </Select>
                    </ ListItemSecondaryAction>
                </ListItem>
            </List>
        )
    }
}