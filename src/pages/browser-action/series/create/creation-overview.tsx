import * as React from 'react';
import { FormikProps } from 'formik';
import { Typography, colors } from '@material-ui/core';
import { ErrorOutlineRounded, DoneAllRounded } from '@material-ui/icons'
import { VButton } from 'components/button';

type OverviewValues = VSync.SeriesBase

export type OverviewProps<FormValues extends OverviewValues> = {
    formik: FormikProps<FormValues>
}

export class CreationOverview<FormValues extends OverviewValues> extends React.Component<OverviewProps<FormValues>> {
    render() {
        const props = this.props;

        const errorArray: Array<{
            msg: string
        }> = [];

        const errors = props.formik.errors;
        for(const key in errors) {
            const msg = errors[key];
            errorArray.push({
                msg: msg.toString()
            })
        }

        const valid = props.formik.isValid;
        if(!valid && errorArray.length === 0) {
            errorArray.push({
                msg: 'Fill out the form'
            })
        }

        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
            }}>

                {
                    valid ?
                        <div style={{
                            display: 'flex',
                            flexGrow: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <VButton
                                variant='extendedFab'
                                status={props.formik.isValid ? (props.formik.isSubmitting ? 'loading' : 'default') : 'disabled'}
                                style={{
                                    color: '#FFF',
                                    backgroundColor: colors.green[500]
                                }}
                                onClick={() => props.formik.handleSubmit()}
                            >
                                <DoneAllRounded style={{
                                    marginRight: '10px',
                                }} />
                                Finish
                            </VButton>
                        </div>
                        :
                        <div style={{
                            display: 'flex',
                            flexGrow: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <ErrorOutlineRounded style={{
                                color: colors.red[500],
                                marginBottom: '10px',
                                height: '50px',
                                width: '50px'
                            }} />
                            <Typography variant='subheading' style={{
                                marginBottom: '10px'
                            }}>
                                There are still some things for you to do:
                            </Typography>
                            {errorArray.map(err => (
                                <Typography variant='body1' style={{
                                    color: colors.red[500]
                                }}>
                                    {err.msg}
                                </Typography>
                            ))}
                        </div>
                }

            </div>
        )
    }
}