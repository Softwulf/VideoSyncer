import * as React from 'react';
import { Button, Select, MenuItem, Menu, Typography, Dialog, DialogTitle, List, ListItem, ListItemText, DialogContent, TextField } from '@material-ui/core';
import { browser } from 'webextension-polyfill-ts';
import * as UrlParse from 'url-parse';

export type UrlInfo = {
    host: string
    pathname: string
}

type UrlPickerState = {
    hostDialogOpen: boolean
    host: string
    possibleUrls: {
        [host: string]: string[]
    }
}

export class UrlPicker extends React.Component<{}, UrlPickerState> {
    state = {
        host: '',
        hostDialogOpen: false,
        possibleUrls: {}
    }

    async componentDidMount() {
        const tabs = await browser.tabs.query({
            url: [
                'http://*/*',
                'https://*/*'
            ]
        });

        const tabObj: UrlPickerState['possibleUrls'] = tabs.reduce((prev, tab) => {
            const parsedUrl = new UrlParse(tab.url);

            let pathnames = prev[parsedUrl.host];

            if (pathnames && pathnames.indexOf(parsedUrl.pathname) !== -1) {
                return prev;
            }
            if (!pathnames) pathnames = [];

            return {
                ...prev,
                [parsedUrl.host]: [...pathnames, parsedUrl.pathname]
            }
        }, {});

        this.setState({
            possibleUrls: tabObj
        });
    }

    setHost = (host: string) => {
        console.log(host);
        this.setState({ host, hostDialogOpen: false });
    };

    handleOpen = event => {
        this.setState({ hostDialogOpen: true });
    };

    handleClose = () => {
        this.setState({ hostDialogOpen: false });
    };


    render() {
        const menuItems: JSX.Element[] = [];
        for (const host in this.state.possibleUrls) {
            menuItems.push(
                <ListItem button onClick={() => this.setHost(host)} key={host}>
                    <ListItemText primary={host} />
                </ListItem>
            )
        }
        return (
            <div style={{ wordBreak: 'break-word', textAlign: 'center', padding: '10px', display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Typography variant='display2'>Select Website</Typography>
                <Typography variant='body2'>VideoSyncer needs to know on which website you watch the series.</Typography>
                <Button variant='contained' color='secondary' onClick={this.handleOpen}>
                    Select Website
                </Button>
                Or enter manually
                <TextField
                    label='Website Domain'
                    placeholder='example.com'
                    fullWidth
                    value={this.state.host}
                    onChange={event => this.setHost(event.target.value)}
                />

                <Dialog onClose={this.handleClose} open={this.state.hostDialogOpen}>
                    <DialogTitle>Choose Website</DialogTitle>
                    <DialogContent className='has-scrollbars'>
                        <List>
                            {menuItems}
                        </List>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}