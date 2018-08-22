import * as React from 'react';
import { ThemeState } from 'pages/_redux/themes/types';
import { Button, CircularProgress, Typography, Collapse, IconButton } from '@material-ui/core';
import { ApplicationState } from 'pages/_redux';
import { connect } from 'react-redux';
import { UserState } from 'pages/_redux/users/types';
import { SeriesState } from 'pages/_redux/series/types';
import { bind } from 'bind-decorator';
import { ExpandMore } from '@material-ui/icons';
import { DisconnectedView } from './error-views/disconnected-view';
import { LoadingView } from './loading-view';
import { NoSeriesView } from './error-views/no-series-view';
import { NoUserView } from './error-views/no-user-view';
import { SeriesManager } from './series/series-manager';

type ContentScriptRootReduxProps = {
    theme: ThemeState
    user: UserState
    series: SeriesState
}

type ContentScriptRootState = {
    expanded: boolean
    disconnected: boolean
    loading: boolean
    matchingSeries: VSync.Series
}

class ContentScriptRootViewBase extends React.Component<ContentScriptRootReduxProps, ContentScriptRootState> {
    constructor(props) {
        super(props);

        this.state = {
            expanded: true,
            disconnected: false,
            loading: true,
            matchingSeries: undefined
        }
    }

    @bind
    setMatchingSeries(series?: VSync.Series) {
        this.setState({
            matchingSeries: series,
            loading: false
        })
    }

    @bind
    setDisconnected(disconnected: boolean) {
        this.setState({
            disconnected,
            expanded: true
        })
    }

    render() {
        let view: JSX.Element;

        if(this.state.disconnected) {
            view = <DisconnectedView />
        } else if(this.state.loading) {
            view = <LoadingView />
        } else if(!this.props.user.user) {
            view = <NoUserView />
        } else if(!this.state.matchingSeries) {
            view = <NoSeriesView />
        } else {
            view = <SeriesManager series={this.state.matchingSeries} />;
        }

        return (
            <div style={{
                width: '100%',
                height: '100%'
            }}>
                <IconButton
                    onClick={() => this.setState({expanded: !this.state.expanded})}
                    aria-expanded={this.state.expanded}
                    aria-label='Show more'
                    style={{
                        transform: this.state.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: this.props.theme.theme.transitions.create('transform', {
                            duration: this.props.theme.theme.transitions.duration.shortest
                        }),
                        zIndex: 1000,
                        backgroundColor: this.props.theme.theme.palette.primary.main,
                        color: '#FFF',
                        position: 'absolute',
                        top: '5px',
                        right: '5%'
                    }}
                    >
                    <ExpandMore style={{
                        margin: 0
                    }} />
                </IconButton>
                <Collapse 
                    in={this.state.expanded}
                    style={{
                        backgroundColor: this.props.theme.theme.palette.background.default,
                        borderBottom: `2px solid ${this.props.theme.theme.palette.primary.main}`
                    }}
                    >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px'
                        }}
                    >
                        {view}
                    </div>
                </Collapse>
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

export const ContentScriptRootView = connect<ContentScriptRootReduxProps>(mapStateToProps, null, null, { withRef: true })(ContentScriptRootViewBase);