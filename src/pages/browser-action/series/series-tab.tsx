import * as React from 'react';
import { List, ListSubheader, ListItem, ListItemText, CircularProgress, Typography, Button } from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import { firebase } from '../../../firebase';
import { UserState } from '../../_redux/users/types';
import { connect } from 'react-redux';
import { ApplicationState } from '../../_redux';
import { Link, Switch, Route } from 'react-router-dom';
import { RouterState } from 'connected-react-router';
import { SeriesState } from '../../_redux/series/types';
import { SeriesCreate } from './series-create';
import { SeriesList } from './series-list';

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
                    <Route path='/new' component={SeriesCreate} />
                    <Route render={() => {
                        return (
                            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'stretch'}}>
                                <SeriesList series={this.props.series.series_list} />
                                <Button variant='fab' color='primary' style={{alignSelf: 'flex-end', justifySelf: 'flex-end', margin: '10px', flexBasis: 'content'}} component={this.newSeriesLink}>
                                    <AddCircle />
                                </Button>
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