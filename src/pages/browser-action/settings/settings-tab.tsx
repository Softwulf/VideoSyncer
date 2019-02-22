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
    forcingError: boolean
}

class SettingsTabBase extends React.Component<SettingsTabProps, SettingsTabState> {

    state = {
        pickerOpen: {},
        forcingError: false
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

    forceError = () => {
        this.setState({ forcingError: true })
    }

    render() {
        if(this.state.forcingError) {
            throw new Error('Manually forced error in settings page');
        }
        return (
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
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
                <Button variant='text' color='secondary' onClick={() => { this.forceError() }}>
                    Force Crash VideoSyncer
                </Button>
            </div>
        )
    }
}

export const SettingsTab = connect<SettingsTabProps>((state: ApplicationState): SettingsTabProps => {
    return {
        theme: state.theme
    }
}, null)(SettingsTabBase);