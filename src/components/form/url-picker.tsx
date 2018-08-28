import * as React from 'react';
import { Button, Select, MenuItem, Menu, Typography, Dialog, DialogTitle, List, ListItem, ListItemText, DialogContent, TextField, FormControl, InputLabel, Input, FormHelperText, InputAdornment, colors, withTheme, WithTheme } from '@material-ui/core';
import { browser } from 'webextension-polyfill-ts';
import * as UrlParse from 'url-parse';
import { VInputProps } from './types';
import { InputProps } from '@material-ui/core/Input';

type UrlPickerState = {
    hostDialogOpen: boolean
    possibleUrls: {
        [host: string]: string[]
    }
}

export type UrlPickerProps = {
    pickText: string
    dialogTitle: string
}

class VUrlPickerBase<T> extends React.Component<VInputProps<InputProps, T> & UrlPickerProps, UrlPickerState> {
    state = {
        hostDialogOpen: false,
        possibleUrls: {},
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

    handleOpen = event => {
        this.setState({ hostDialogOpen: true });
    };

    handleClose = () => {
        this.setState({ hostDialogOpen: false });
    };


    render() {
        const { formik, fieldName, ...restProps } = this.props;
        const value = formik.values[fieldName];

        const menuItems: JSX.Element[] = [];
        for (const host in this.state.possibleUrls) {
            menuItems.push(
                <ListItem button
                    onClick={() => {
                        formik.setFieldValue(fieldName, host)
                        this.setState({ hostDialogOpen: false })
                    }}
                    key={host}
                    >
                    <ListItemText primary={host} />
                </ListItem>
            )
        }
        return (
                <FormControl error={formik.errors[fieldName] != null}>
                    <InputLabel>{restProps.label}</InputLabel>
                    <Input 
                        value={value as any}
                        onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                        startAdornment={
                            <InputAdornment position='start'>
                                <Button style={{color: colors.lightBlue['A200']}} onClick={this.handleOpen}>
                                    {this.props.pickText}
                                </Button>
                            </InputAdornment>
                        }
                        {...restProps}
                    />
                    <FormHelperText>{formik.errors[fieldName]}</FormHelperText>
                    <Dialog onClose={this.handleClose} open={this.state.hostDialogOpen}>
                        <DialogTitle>{this.props.dialogTitle}</DialogTitle>
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

export const VUrlPicker = VUrlPickerBase;