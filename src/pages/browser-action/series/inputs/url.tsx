import * as React from 'react';
import { Button, Select, MenuItem, Menu, Typography, Dialog, DialogTitle, List, ListItem, ListItemText, DialogContent, TextField, FormControl, InputLabel, Input, FormHelperText, InputAdornment, colors, withTheme, WithTheme } from '@material-ui/core';
import { browser } from 'webextension-polyfill-ts';
import * as UrlParse from 'url-parse';

export type UrlPickerProps = {
    updateSeries: (series: Partial<VSync.SeriesBase>) => any
    series: VSync.SeriesBase
    setStepValid: (valid: boolean) => any
}

export type UrlInfo = {
    host: string
    pathname: string
}

type UrlPickerState = {
    hostDialogOpen: boolean
    possibleUrls: {
        [host: string]: string[]
    }
    error: string
}

class UrlPickerBase extends React.Component<UrlPickerProps & WithTheme, UrlPickerState> {
    state = {
        hostDialogOpen: false,
        possibleUrls: {},
        error: ''
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
        const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
        const domainRegex = /^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/

        let error = '';
        if(!host || host.length === 0) {
            error = 'Please enter a website';
        } else if(host.length > 253) {
            error = 'Websites must at max have 253 characters';
        } else if(!host.match(ipRegex) && !host.match(domainRegex)) {
            error = 'Websites must have the correct format (eg. video.example.com)';
        }

        console.log(error);

        this.setState({hostDialogOpen: false, error})
        if(error.length === 0) {
            this.props.setStepValid(true);
        } else {
            this.props.setStepValid(false);
        }
        this.props.updateSeries({
            host
        });
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
                <FormControl error={this.state.error.length > 0} fullWidth>
                    <InputLabel>Website</InputLabel>
                    <Input 
                        value={this.props.series.host}
                        onChange={event => this.setHost(event.target.value)}
                        placeholder='or enter manually'
                        startAdornment={
                            <InputAdornment position='start'>
                                <Button style={{color: colors.lightBlue['A200']}} onClick={this.handleOpen}>
                                    Pick a website
                                </Button>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText>{this.state.error}</FormHelperText>
                    <Dialog onClose={this.handleClose} open={this.state.hostDialogOpen}>
                        <DialogTitle>Choose Website</DialogTitle>
                        <DialogContent className='has-scrollbars'>
                            <List>
                                {menuItems}
                            </List>
                        </DialogContent>
                    </Dialog>
                </FormControl>
        )
    }
}

export const UrlPicker = withTheme()(UrlPickerBase);