import * as React from 'react';
import { MobileStepper, Button, colors } from '@material-ui/core';
import { KeyboardArrowRight, KeyboardArrowLeft, Done, Cancel } from '@material-ui/icons';
import { ThemeState } from '../../_redux/themes/types';
import { ApplicationState, mapDispatch, HasDispatch } from '../../_redux';
import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { browser } from 'webextension-polyfill-ts';
import { UrlPicker } from './inputs/url';

type SeriesCreateReduxProps = {
    theme: ThemeState
}

type SeriesCreateState = {
    activeStep: number
}

const STEP_COUNT = 6;

class SeriesCreateBase extends React.Component<SeriesCreateReduxProps & HasDispatch, SeriesCreateState> {

    state = {
        activeStep: 0
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

    render() {
        return (
            <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch'}}>
                
                <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', overflowY: 'auto'}} className='has-scrollbars'>
                    {
                        this.state.activeStep === 0 && <UrlPicker />
                    }
                </div>
                <MobileStepper
                    variant='dots'
                    steps={6}
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
                                    <Button size='small' style={{backgroundColor: colors.green[500], color: '#FFF'}}>
                                        Finish
                                        <Done style={{marginLeft: this.props.theme.theme.spacing.unit}} fontSize='inherit' />
                                    </Button>
                                    :
                                    <Button size='small' onClick={this.handleNext} disabled={this.state.activeStep === STEP_COUNT-1}>
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
        theme: state.theme
    }
}
export const SeriesCreate = connect(mapStateToProps, mapDispatch)(SeriesCreateBase);