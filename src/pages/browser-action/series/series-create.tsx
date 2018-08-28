import * as React from 'react';
import { MobileStepper, Button, colors, TextField, InputAdornment, Typography } from '@material-ui/core';
import { KeyboardArrowRight, KeyboardArrowLeft, Done, Cancel } from '@material-ui/icons';
import { ThemeState } from '../../_redux/themes/types';
import { ApplicationState, mapDispatch, HasDispatch } from '../../_redux';
import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { browser } from 'webextension-polyfill-ts';
import { UrlPicker } from './inputs/url';
import { bind } from 'bind-decorator';
import { UserState } from '../../_redux/users/types';
import swal from 'sweetalert2';
import { vswal, toast } from 'vsync-swal';
import { MessageSender } from 'background/messages/message-sender';

type SeriesCreateReduxProps = {
    theme: ThemeState
    user: UserState
}

type SeriesCreateState = {
    activeStep: number
    stepValid: boolean
    series: VSync.SeriesBase
}

const STEP_COUNT = 5;

class SeriesCreateBase extends React.Component<SeriesCreateReduxProps & HasDispatch, SeriesCreateState> {
    constructor(props) {
        super(props);
        
        this.state = {
            stepValid: false,
            activeStep: 0,
            series: {
                host: '',
                pathbase: '',
                protocol: 'https',
                currentPath: '',
                currentTime: 0,
                currentMaxTime: 0,
                startTime: 0,
                endTime: 0,
                name: '',
                autoplay: true
            }
        }
    }

    handleNext = () => {
        this.setState(state => ({
            activeStep: state.activeStep + 1,
        }));
    };
    
    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    };

    @bind
    updateSeries(series: Partial<VSync.SeriesBase>) {
        this.setState({
            series: {
                ...this.state.series,
                ...series
            }
        })
    }

    @bind
    setStepValid(valid: boolean) {
        this.setState({
            stepValid: valid
        })
    }

    @bind
    async handleFinish() {
        try {
            await MessageSender.requstSeriesCreate(this.state.series);

            this.props.dispatch(replace('/'));
            toast(
                'Success!',
                `You just created <b>${this.state.series.name}</b>`,
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

    render() {
        return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch'}}>
                
                <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', overflowY: 'auto'}} className='has-scrollbars'>
                    {
                        this.state.activeStep === 0 && <UrlPicker series={this.state.series} updateSeries={this.updateSeries} setStepValid={this.setStepValid} />
                    }
                    {
                        this.state.activeStep === 1 && <div>
                            <TextField
                                label='Path'
                                id='pathbase'
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position='start'><Typography variant='caption'>{this.state.series.host}/</Typography></InputAdornment>,
                                }}
                                value={this.state.series.pathbase}
                                onChange={(event) => this.updateSeries({pathbase: event.target.value})}
                            />
                        </div>
                    }
                    {
                        this.state.activeStep === 2 && <div>
                            Start / End times
                        </div>
                    }
                    {
                        this.state.activeStep === 3 && <div>
                            <TextField
                                label='Name'
                                id='name'
                                fullWidth
                                value={this.state.series.name}
                                onChange={(event) => this.updateSeries({name: event.target.value})}
                            />
                        </div>
                    }
                    {
                        this.state.activeStep === 4 && <div>
                            Finish
                        </div>
                    }
                </div>
                <MobileStepper
                    variant='dots'
                    steps={STEP_COUNT}
                    position='static'
                    activeStep={this.state.activeStep}
                    backButton={
                        <div>
                            { 
                                this.state.activeStep === 0 ?
                                    <Button onClick={() => this.props.dispatch(replace('/'))} size='small' style={{color: colors.red['A200']}}>
                                        <Cancel style={{marginRight: this.props.theme.theme.spacing.unit}} fontSize='inherit' />
                                        Cancel
                                    </Button>
                                    :
                                    <Button size='small' onClick={this.handleBack} disabled={this.state.activeStep === 0}>
                                        <KeyboardArrowLeft />
                                        Back
                                    </Button>
                            }
                        </div>
                    }
                    nextButton={
                        <div>
                            { 
                                this.state.activeStep === STEP_COUNT-1 ?
                                    <Button size='small' style={{backgroundColor: colors.green[500], color: '#FFF'}} disabled={!this.state.stepValid} onClick={this.handleFinish}>
                                        Finish
                                        <Done style={{marginLeft: this.props.theme.theme.spacing.unit}} fontSize='inherit' />
                                    </Button>
                                    :
                                    <Button size='small' onClick={this.handleNext} disabled={this.state.activeStep === STEP_COUNT-1 || !this.state.stepValid}>
                                        Next
                                        <KeyboardArrowRight />
                                    </Button>
                            }
                        </div>
                    }
                />
            </div>
        )
    }
}

const mapStateToProps = (state: ApplicationState): SeriesCreateReduxProps => {
    return {
        theme: state.theme,
        user: state.user
    }
}
export const SeriesCreate = connect(mapStateToProps, mapDispatch)(SeriesCreateBase);