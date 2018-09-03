import * as React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, Button, Typography, IconButton, Tooltip } from '@material-ui/core';
import { secondsToHms } from 'vutil';
import { browser } from 'webextension-polyfill-ts';
import { Link } from 'react-router-dom';
import { SeriesProgress } from 'components/series-progress';
import { LaunchRounded, EditRounded } from '@material-ui/icons'

export type SingleSeriesViewProps = {
    series: VSync.Series
}


const EditSeriesLink: React.SFC<{seriesid: string}> = (props) => <Link to={`edit/${props.seriesid}`} {...props as any} />

export const SingleSeriesView: React.SFC<SingleSeriesViewProps> = (props: SingleSeriesViewProps) => {

    const { series } = props;

    return (
        <ListItem divider key={series.key} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
        }}>
            <div style={{
            }}>
                <Typography
                    variant='subheading' 
                    >
                    {series.name}
                </Typography>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Tooltip title='Open Website'>
                    <IconButton
                        color='primary'
                        onClick={() => {
                            browser.tabs.create({
                                url: `${series.protocol ? series.protocol : 'https'}://${series.host}/${series.pathbase}${series.currentPath}`
                            })
                        }}>
                        <LaunchRounded />
                    </IconButton>
                </Tooltip>
                <Typography
                    variant='caption'
                    style={{
                        flexGrow: 1,
                        textAlign: 'center'
                    }}
                    >
                    {secondsToHms(series.currentTime, true)}
                </Typography>
                <Tooltip title='Edit'>
                    <IconButton
                        component={EditSeriesLink as any}
                        {...{seriesid: series.key} as any}
                        >
                        <EditRounded />
                    </IconButton>
                </Tooltip>
            </div>
            <div style={{
                marginTop: '10px'
            }}>
                <SeriesProgress series={series} />
            </div>
        </ListItem>
    )
}