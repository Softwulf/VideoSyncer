import * as React from 'react';
import { Typography, Theme, Button, Select, List, ListSubheader, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Switch, FormControl, InputLabel, MenuItem } from '@material-ui/core';
import { Palette as PaletteIcon, Bluetooth } from '@material-ui/icons';
import { ThemeState } from '../../_redux/themes/types';
import { connect } from 'react-redux';
import { ApplicationState } from '../../_redux';
import { MessageSender } from 'background/messages/message-sender';

export type SettingsTabProps = {
    theme: ThemeState
}

export type SettingsTabState = {
    pickerOpen: {[name: string]: boolean}
}

class SettingsTabBase extends React.Component<SettingsTabProps, SettingsTabState> {

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
                            value={this.props.theme.name}
                            onChange={(event) => MessageSender.requestSettingsUpdate({
                                theme: event.target.value
                            })}
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

export const SettingsTab = connect<SettingsTabProps>((state: ApplicationState): SettingsTabProps => {
    return {
        theme: state.theme
    }
}, null)(SettingsTabBase);