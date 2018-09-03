import * as React from 'react';
import { AppBar, Toolbar, Typography, Avatar, Button, colors, Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from '@material-ui/core';
import { ExitToAppRounded } from '@material-ui/icons';
import { ApplicationState } from '../../_redux';
import { UserState } from '../../_redux/users/types';
import { connect } from 'react-redux';
import { MessageSender } from 'background/messages/message-sender';
import { bind } from 'bind-decorator';

type HeaderProps = {
    user: UserState
}

type HeaderState = {
    anchorEl?: any
}

class HeaderBase extends React.Component<HeaderProps, HeaderState> {
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    @bind
    handleMenu(event) {
        this.setState({
            anchorEl: event.currentTarget
        });
    };
    
    @bind
    handleClose() {
        this.setState({
            anchorEl: null 
        });
    };

    render() {
        const anchorEl = this.state.anchorEl;
        const menuOpen = Boolean(anchorEl);

        return (
            <AppBar position='sticky' color='primary'>
                <Toolbar variant='dense' color='inherit'>
                    <Typography variant='title' color='inherit' style={{flexGrow: 1}}>
                        VSync
                    </Typography>
                    {
                        this.props.user.user ?
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant='subheading' color='inherit' style={{paddingLeft: '5px', paddingRight: '5px'}}>
                                    {this.props.user.user.displayName}
                                </Typography>
                                <IconButton
                                    aria-owns={open ? 'menu-appbar' : null}
                                    aria-haspopup='true'
                                    onClick={this.handleMenu}
                                    color='inherit'
                                >
                                    <Avatar alt={this.props.user.user.displayName} src={this.props.user.user.photoURL}/>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={menuOpen}
                                    onClose={this.handleClose}
                                    >
                                    <MenuItem
                                        onClick={() => {
                                            this.handleClose();
                                            MessageSender.requestUserSignOut()
                                        }}
                                        >
                                        <ListItemIcon>
                                            <ExitToAppRounded style={{ color: colors.red[900] }} />
                                        </ListItemIcon>
                                        <ListItemText primary='Sign out' />
                                    </MenuItem>
                                </Menu>
                            </div>
                        :
                            <Button style={{backgroundColor: colors.deepPurple[500], color: '#FFF'}} variant='contained' onClick={MessageSender.requestUserSignIn}>Sign in</Button>
                    }
                </Toolbar>
            </AppBar>
        )
    }
}

const mapStateToProps: (state: ApplicationState) => HeaderProps = (state) => {
    return {
        user: state.user
    }
}

export const VHeader = connect<HeaderProps>(mapStateToProps, null)(HeaderBase);