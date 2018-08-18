import * as React from 'react';
import { ThemeState } from 'pages/_redux/themes/types';
import { Button, CircularProgress, Typography } from '@material-ui/core';
import { ApplicationState } from 'pages/_redux';
import { connect } from 'react-redux';
import { UserState } from 'pages/_redux/users/types';
import { SeriesState } from 'pages/_redux/series/types';

type ContentScriptRootReduxProps = {
    theme: ThemeState
    user: UserState
    series: SeriesState
}

class ContentScriptRootViewBase extends React.Component<ContentScriptRootReduxProps, {}> {
    render() {
        if(this.props.user.loading || this.props.series.loading) {
            return <div style={{display: 'flex', width: '100%', height: '100%', padding: '20px', justifyContent: 'center', alignItems: 'center', backgroundColor: this.props.theme.theme.palette.background.default}}><CircularProgress variant='indeterminate' color='primary' /></div>
        }
        if(this.props.user.user) {
            return (
                <div style={{padding: '10px', width: '100%', height: '100%', backgroundColor: this.props.theme.theme.palette.background.default}}>
                    <Button variant='contained' color='primary'>
                        {this.props.user.user.displayName}
                    </Button>
                    <Typography>
                        {JSON.stringify(this.props.series.series_list)}
                    </Typography>
                </div>
            )
        } else {
            return <div>No user</div>
        }
    }
}

const mapStateToProps = (state: ApplicationState): ContentScriptRootReduxProps => {
    return {
        theme: state.theme,
        user: state.user,
        series: state.series
    }
}

export const ContentScriptRootView = connect<ContentScriptRootReduxProps>(mapStateToProps, null)(ContentScriptRootViewBase);