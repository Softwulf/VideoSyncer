import * as React from 'react';
import { ThemeState } from 'pages/_redux/themes/types';
import { Button, CircularProgress, Typography } from '@material-ui/core';
import { ApplicationState } from 'pages/_redux';
import { connect } from 'react-redux';
import { UserState } from 'pages/_redux/users/types';
import { SeriesState } from 'pages/_redux/series/types';
import { bind } from 'bind-decorator';

type ContentScriptRootReduxProps = {
    theme: ThemeState
    user: UserState
    series: SeriesState
}

type ContentScriptRootState = {
    matchingSeriesId?: VSync.Series['key']
}

class ContentScriptRootViewBase extends React.Component<ContentScriptRootReduxProps, ContentScriptRootState> {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    @bind
    findMatchingSeries(props: ContentScriptRootReduxProps) {
        const matchingSeries = props.series.series_list.find(series => {
            return window.location.host === series.host && window.location.pathname.startsWith('/'+series.pathbase);
        });

        if(!matchingSeries) {
            this.setState({
                matchingSeriesId: ''
            });
            return;
        }
        if(!this.state.matchingSeriesId || this.state.matchingSeriesId !== matchingSeries.key) {
            this.setState({
                matchingSeriesId: matchingSeries.key
            })
        }
    }

    @bind
    getCurrentSeries() {
        return this.props.series.series_list.find(series => series.key === this.state.matchingSeriesId);
    }

    componentDidMount() {
        this.findMatchingSeries(this.props);
    }

    componentWillReceiveProps(newProps) {
        this.findMatchingSeries(newProps);
    }

    render() {
        if(this.props.series.loading) {
            return <div style={{display: 'flex', width: '100%', height: '100%', padding: '20px', justifyContent: 'center', alignItems: 'center', backgroundColor: this.props.theme.theme.palette.background.default}}><CircularProgress variant='indeterminate' color='primary' /></div>
        }
        if(!this.getCurrentSeries()) {
            return (
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: '20px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: this.props.theme.theme.palette.background.default
                }}>
                <Typography variant='title'>
                    No matching series found
                </Typography>
                </div>
            )
        }
        if(!this.props.user.user) {
            return (
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    padding: '20px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: this.props.theme.theme.palette.background.default
                }}>
                <Typography variant='title'>
                    You are signed out
                </Typography>
                </div>
            )
        }
        return (
            <div style={{padding: '20px', width: '100%', height: '100%', backgroundColor: this.props.theme.theme.palette.background.default}}>
                <Button variant='contained' color='primary'>
                    {this.getCurrentSeries().name}
                </Button>
            </div>
        )
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