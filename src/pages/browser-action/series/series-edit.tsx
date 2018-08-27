import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { SeriesState } from '../../_redux/series/types';
import { connect } from 'react-redux';
import { ApplicationState, mapDispatch, HasDispatch } from '../../_redux';
import { bind } from 'bind-decorator';
import { Typography, Button, colors, Divider, TextField, InputAdornment } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { UserState } from '../../_redux/users/types';
import { replace } from 'connected-react-router';
import swal from 'sweetalert2';
import { vswal, toast } from 'vsync-swal';
import { UrlPicker } from './inputs/url';
import { MessageSender } from 'background/messages/message-sender';
import { SeriesEditForm } from './edit/edit-form';

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
    async handleSave() {
        const { name, key } = this.state.currentSeries;
        try {
            await MessageSender.requestSeriesEdit(key, this.state.currentSeries);

            this.props.dispatch(replace('/'));
            toast(
                'Saved!',
                `<b>${name}</b> was saved successfully`,
                'success'
            )
        } catch(err) {
            vswal(
                'Error',
                `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                'error'
            )
        }
    }

    @bind
    async handleDelete() {
        const { name, key } = this.state.currentSeries;
        const result = await vswal({
            title: 'Are you sure?',
            html: `<b>${name}</b> will be gone forever`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: colors.red[500]
        });
        if(result.value) {
            try {
                await MessageSender.requestSeriesDelete(key);

                this.props.dispatch(replace('/'));
                toast(
                    'Deleted!',
                    `<b>${name}</b> was deleted successfully`,
                    'success'
                )
            } catch(err) {
                vswal(
                    'Error',
                    `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                    'error'
                )
            }
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
            content = <SeriesEditForm series={this.state.currentSeries} />
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