import * as React from 'react';
import { ListItem, ListItemText, Typography, Button, List, ListSubheader, ListItemSecondaryAction } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import { browser } from 'webextension-polyfill-ts';
import { secondsToHms } from 'vutil';
import { SingleSeriesView } from './single-series';

export type SeriesListProps = {
    series: VSync.Series[]
}

const NewSeriesLink: React.SFC = (props) => <Link to='new' {...props as any} />

export const SeriesList: React.SFC<SeriesListProps> = (props: SeriesListProps) => {
    

    if(props.series.length === 0) {
        return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                <Typography variant='headline'>Get started by creating a series</Typography>
                <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}} component={NewSeriesLink}>
                    <AddCircle style={{marginRight: '10px'}} />
                    Create your first series
                </Button>
            </div>
        )
    }

    const list = props.series.map(series => {
        return <SingleSeriesView series={series} />
    });
    return (
        <List subheader={<ListSubheader disableSticky>Series</ListSubheader>} style={{flexGrow: 1, overflowY: 'auto'}} className='has-scrollbars'>
            {list}
        </List>
    )
}