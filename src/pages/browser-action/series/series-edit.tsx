import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { SeriesState } from '../../_redux/series/types';
import { connect } from 'react-redux';
import { ApplicationState, mapDispatch, HasDispatch } from '../../_redux';
import { bind } from 'bind-decorator';
import { Typography, Button, colors, Divider, TextField, InputAdornment } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { firebase } from '../../../firebase';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { UserState } from '../../_redux/users/types';
import { replace } from 'connected-react-router';
import swal from 'sweetalert2';
import { vswal, toast } from 'vsync-swal';
import { UrlPicker } from './inputs/url';

type SeriesEditOwnProps = {

} & RouteComponentProps<any>

type SeriesEditReduxProps = {
    series: SeriesState
    user: UserState
}

type SeriesEditState = {
    currentSeries?: VSync.Series
}

const BackButtonLink: React.SFC = (props) => <Link to='/' {...props} />

class SeriesEditBase extends React.Component<SeriesEditOwnProps & SeriesEditReduxProps & HasDispatch, SeriesEditState> {
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    @bind
    fetchSeries() {
        const seriesId = this.props.match.params.seriesid;
        const currentSeries = this.props.series.series_list.find(s => s.key === seriesId);
        this.setState({
            currentSeries
        })
    }

    componentDidMount() {
        this.fetchSeries();
    }

    componentWillReceiveProps(newProps) {
        this.fetchSeries();
    }

    render() {
        let content: JSX.Element =  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                                        <Typography variant='body2'>
                                            This series does no longer exist.
                                        </Typography>
                                    </div>

        if(this.state.currentSeries) {
            content =   <div style={{flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexDirection: 'column'}}>
                            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch'}}>
                                <TextField
                                    label='Name'
                                    id='name'
                                    fullWidth
                                    value={this.state.currentSeries.name}
                                    onChange={(event) => this.setState({currentSeries: {
                                        ...this.state.currentSeries,
                                        name: event.target.value
                                    }})}
                                />
                                {/* <UrlPicker
                                    series={this.state.currentSeries}
                                    updateSeries={(toUpdate: Partial<VSync.Series>) => {
                                        this.setState({
                                            currentSeries: {
                                                ...this.state.currentSeries,
                                                ...toUpdate
                                            }
                                        })
                                    }}
                                    setStepValid={() => {}}
                                /> */}
                                <TextField
                                    label='Website'
                                    id='website'
                                    fullWidth
                                    value={this.state.currentSeries.host}
                                    onChange={(event) => this.setState({currentSeries: {
                                        ...this.state.currentSeries,
                                        host: event.target.value
                                    }})}
                                />
                                <TextField
                                    label='Path'
                                    id='path'
                                    fullWidth
                                    value={this.state.currentSeries.pathbase}
                                    InputProps={{
                                        startAdornment: <InputAdornment position='start'><Typography variant='caption'>{this.state.currentSeries.host}/</Typography></InputAdornment>,
                                    }}
                                    onChange={(event) => this.setState({currentSeries: {
                                        ...this.state.currentSeries,
                                        pathbase: event.target.value
                                    }})}
                                />
                            </div>


                            <div style={{display: 'flex', alignItems: 'stretch', flexDirection: 'column', flexBasis: 'content'}}>
                                <Button 
                                    onClick={() => {
                                        firebase.database().ref(`vsync/series/${this.props.user.user.uid}/${this.state.currentSeries.key}`).update(this.state.currentSeries, err => {
                                            if(err) {
                                                vswal(
                                                    'Error',
                                                    `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                                                    'error'
                                                )
                                            } else {
                                                this.props.dispatch(replace('/'));
                                                toast(
                                                    'Saved!',
                                                    `<b>${this.state.currentSeries.name}</b> was saved successfully`,
                                                    'success'
                                                )
                                            }
                                        });
                                    }}
                                    variant='contained'
                                    style={{
                                        backgroundColor: colors.green[500],
                                        color: '#FFF'
                                    }}>
                                    Save
                                </Button>
                                <Divider style={{
                                    marginTop: '10px',
                                    marginBottom: '10px'
                                }} />
                                <Button 
                                    onClick={async () => {
                                        const { name } = this.state.currentSeries;
                                        const result = await vswal({
                                            title: 'Are you sure?',
                                            html: `<b>${name}</b> will be gone forever`,
                                            type: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'Delete',
                                            confirmButtonColor: colors.red[500]
                                        });
                                        if(result.value) {
                                            firebase.database().ref(`vsync/series/${this.props.user.user.uid}/${this.state.currentSeries.key}`).remove(err => {
                                                if(err) {
                                                    vswal(
                                                        'Error',
                                                        `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                                                        'error'
                                                    )
                                                } else {
                                                    this.props.dispatch(replace('/'));
                                                    vswal(
                                                        'Deleted!',
                                                        `<b>${name}</b> was deleted successfully`,
                                                        'success'
                                                    )
                                                }
                                            });
                                        }
                                    }}
                                    variant='contained'
                                    style={{
                                        backgroundColor: colors.red[500],
                                        color: '#FFF'
                                    }}>
                                    Delete
                                </Button>
                            </div>
                        </div>
        }

        return  <div style={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'stretch', flexDirection: 'column', margin: '10px'}}>
                    <div style={{flexBasis: 'content', alignSelf: 'flex-start'}}>
                        <Button variant='text' component={BackButtonLink}>
                            <KeyboardArrowLeft />
                            Back
                        </Button>
                    </div>
                    {content}
                </div>
    }
}

const mapStateToProps = (state: ApplicationState): SeriesEditReduxProps => {
    return {
        series: state.series,
        user: state.user
    }
}
export const SeriesEdit = connect(mapStateToProps, mapDispatch)(SeriesEditBase);