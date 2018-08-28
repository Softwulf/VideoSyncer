import * as React from 'react';
import { MobileStepper, Button, colors, TextField, InputAdornment, Typography } from '@material-ui/core';
import { KeyboardArrowRight, KeyboardArrowLeft, Done, Cancel } from '@material-ui/icons';
import { ThemeState } from '../../_redux/themes/types';
import { ApplicationState, mapDispatch, HasDispatch } from '../../_redux';
import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { browser } from 'webextension-polyfill-ts';
import { bind } from 'bind-decorator';
import { UserState } from '../../_redux/users/types';
import swal from 'sweetalert2';
import { vswal, toast } from 'vsync-swal';
import { MessageSender } from 'background/messages/message-sender';
import { withFormik, FormikProps } from 'formik';
import { SeriesValidationSchema, getDefaultSeries } from 'vutil';
import { VButton } from 'components/button';
import { MatchSelector } from './create/match-selector';
import { TimeSelector } from './create/time-selector';
import { NameSelector } from './create/name-selector';
import { CreationOverview } from './create/creation-overview';

export type SeriesCreateReduxProps = {
    theme: ThemeState
    user: UserState
}

export type SeriesCreateState = {
    activeStep: number
}

export type FormValues = VSync.SeriesBase

export type OuterProps = SeriesCreateReduxProps & HasDispatch;

const STEP_COUNT = 4;

class SeriesCreateFormBase extends React.Component<OuterProps & FormikProps<FormValues>, SeriesCreateState> {

    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0
        }
    }

    handleNext = () => {
        this.setState(state => ({
            activeStep: state.activeStep < STEP_COUNT ? state.activeStep + 1 : STEP_COUNT,
        }));
    };
    
    handleBack = () => {
        this.setState(state => ({
            activeStep: state.activeStep > 0 ? state.activeStep - 1 : 0,
        }));
    };

    render() {
        const props = this.props;

        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column'
            }}>

                <div style={{
                    display: 'flex',
                    flexGrow: 1
                }}>
                    {this.state.activeStep === 0 && <MatchSelector formik={props} />}
                    {this.state.activeStep === 1 && <TimeSelector formik={props} />}
                    {this.state.activeStep === 2 && <NameSelector formik={props} />}
                    {this.state.activeStep === 3 && <CreationOverview formik={props} />}
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
                                    <VButton
                                        size='small'
                                        style={{
                                            backgroundColor: colors.green[500],
                                            color: '#FFF'
                                        }}
                                        status={props.isSubmitting ? 'loading' : (props.isValid ? 'default' : 'disabled')}
                                        onClick={() => props.handleSubmit()}
                                        >
                                        Finish
                                    </VButton>
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
        theme: state.theme,
        user: state.user
    }
}
export const SeriesCreateForm = connect(mapStateToProps, mapDispatch)(withFormik<OuterProps, FormValues>({
    displayName: 'SeriesCreateForm',
    mapPropsToValues: (props) => {
        return getDefaultSeries()
    },
    validationSchema: SeriesValidationSchema,

    handleSubmit: async (values, { setSubmitting, ...rest }) => {
        const { name } = values;

        try {
            await MessageSender.requstSeriesCreate(values);

            setSubmitting(false);

            rest.props.dispatch(replace('/'));

            toast(
                'Success!',
                `You just created <b>${name}</b>`,
                'success'
            )
        } catch(err) {
            vswal(
                'Error',
                `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                'error'
            )
            setSubmitting(false);
        }
    },
})(SeriesCreateFormBase));