import * as React from 'react';
import { LinearProgress, colors } from '@material-ui/core';
import { LinearProgressProps } from '@material-ui/core/LinearProgress';

export type SeriesProgressProps = {
    series: VSync.Series
} & LinearProgressProps

export const SeriesProgress: React.SFC<SeriesProgressProps> = (props: SeriesProgressProps) => {
    const { series, ...rest } = props;

    let value = (100 / series.currentMaxTime) * series.currentTime;
    if(!series.currentMaxTime) {
        value = 0;
    }

    return <LinearProgress
                variant='determinate'
                value={value}
                style={{
                    color: colors.purple[500]
                }}
                {...rest}
            />
}