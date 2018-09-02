import * as React from 'react';
import { List, ListSubheader, ListItem, ListItemText, CircularProgress, Typography, Button, colors, Tooltip } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { UserState } from '../../_redux/users/types';
import { connect } from 'react-redux';
import { ApplicationState } from '../../_redux';
import { Link, Switch, Route } from 'react-router-dom';
import { RouterState } from 'connected-react-router';
import { SeriesState } from '../../_redux/series/types';
import { SeriesCreateForm } from './series-create';
import { SeriesList } from './series-list';
import { SeriesEdit } from './series-edit';

export type SeriesTabProps = {
    user: UserState
    series: SeriesState
    router: RouterState
}

class SeriesTabBase extends React.Component<SeriesTabProps, {}> {
    newSeriesLink = (props) => <Link to='new' {...props as any} />

    render() {
        if(this.props.series.loading) {
            return <div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}><CircularProgress variant='indeterminate' color='secondary' /></div>
        }

        return (
            <div style={{display: 'flex', flexGrow: 1}}>
                <Switch>
                    <Route path='/edit/:seriesid' component={SeriesEdit} />
                    <Route path='/new' component={SeriesCreateForm} />
                    <Route render={() => {
                        return (
                            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'stretch'}}>
                                <SeriesList series={this.props.series.series_list} />
                                <div style={{alignSelf: 'flex-end', justifySelf: 'flex-end', margin: '10px', flexBasis: 'content'}}>
                                    <Tooltip title='New Series'>
                                        <Button variant='fab' color='primary' component={this.newSeriesLink}>
                                            <AddCircle />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        )
                    }} />
                </Switch>
            </div>
        )
    }
}

export const SeriesTab = connect<SeriesTabProps>((state: ApplicationState): SeriesTabProps => {
    return {
        user: state.user,
        series: state.series,
        router: state.router
    }
}, null)(SeriesTabBase);