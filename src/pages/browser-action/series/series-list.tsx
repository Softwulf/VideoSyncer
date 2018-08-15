import * as React from 'react';
import { ListItem, ListItemText, Typography, Button, List, ListSubheader } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { Link } from 'react-router-dom';

export type SeriesListProps = {
    series: VSync.Series[]
}

export const SeriesList: React.SFC<SeriesListProps> = (props: SeriesListProps) => {
    if(props.series.length === 0) {
        return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                <Typography variant='headline'>Get started by creating a series</Typography>
                <Button variant='extendedFab' color='primary' style={{marginTop: '20px'}} component={(props) => <Link to='new' {...props as any} />}>
                    <AddCircle style={{marginRight: '10px'}} />
                    Create your first series
                </Button>
            </div>
        )
    }

    const list = props.series.map(series => {
        return (
            <ListItem divider key={series.key}>
                <ListItemText primary={series.name} secondary={series.currentTime} />
            </ListItem>
        )   
    });
    return (
        <List subheader={<ListSubheader disableSticky>Series</ListSubheader>} style={{flexGrow: 1}}>
            {list}
        </List>
    )
}