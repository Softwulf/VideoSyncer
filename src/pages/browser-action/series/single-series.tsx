import * as React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, Button } from '@material-ui/core';
import { secondsToHms } from 'vutil';
import { browser } from 'webextension-polyfill-ts';
import { Link } from 'react-router-dom';

export type SingleSeriesViewProps = {
    series: VSync.Series
}


const EditSeriesLink: React.SFC<{seriesid: string}> = (props) => <Link to={`edit/${props.seriesid}`} {...props as any} />

export const SingleSeriesView: React.SFC<SingleSeriesViewProps> = (props: SingleSeriesViewProps) => {

    const { series } = props;

    return (
        <ListItem divider key={series.key}>
            <ListItemText primary={series.name} secondary={secondsToHms(series.currentTime, true)} />
            <ListItemSecondaryAction>
                <Button variant='contained' color='secondary' onClick={() => {
                    browser.tabs.create({
                        url: `${series.protocol ? series.protocol : 'https'}://${series.host}/${series.pathbase}${series.currentPath}`
                    })
                }}>
                    Launch
                </Button>
                <Button variant='contained' color='primary' component={EditSeriesLink as any} {...{seriesid: series.key} as any}>
                    Edit
                </Button>
            </ListItemSecondaryAction>
        </ListItem>
    )
}