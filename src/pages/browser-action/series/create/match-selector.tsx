import * as React from 'react';
import { FormikProps } from 'formik';
import { VUrlPicker } from 'components/form/url-picker';
import { VTextInput } from 'components/form/text-input';
import { InputAdornment, Typography } from '@material-ui/core';
import { shorten } from 'vutil';

type MatchSelectorValues = {
    host: string
    pathbase: string
    protocol: VSync.Protocol
}

export type MatchSelectorProps<FormValues extends MatchSelectorValues> = {
    formik: FormikProps<FormValues>
}

export class MatchSelector<FormValues extends MatchSelectorValues> extends React.Component<MatchSelectorProps<FormValues>> {
    render() {
        const props = this.props;

        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <Typography variant='headline'>
                    Select Website
                </Typography>
                <Typography variant='body1'>
                    VideoSyncer needs to know where it should track this series. Simply pick a website and define on what part of the site (called path) this series is.
                </Typography>
                <Typography variant='caption'>
                    Example: You watch your series at https://watch.example.com/series/one-piece/episode-358
                    <br />
                    In that case you would select watch.example.com as the website and series/one-piece as path.
                </Typography>
                <div style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <VUrlPicker<FormValues>
                        formik={props.formik}
                        fieldName='host'
                        label='Websites'
                        id='website'
                        placeholder='Or enter one manually'
                        pickText='Pick a website'
                        dialogTitle='Choose Website'
                        fullWidth
                    />
                    <VTextInput<FormValues>
                        formik={props.formik}
                        fieldName='pathbase'
                        label='Path'
                        id='path'
                        fullWidth
                        startAdornment={<InputAdornment position='start'><Typography variant='caption'>{shorten(props.formik.values.host, 20)}/</Typography></InputAdornment>}
                    />
                </div>
            </div>
        )
    }
}