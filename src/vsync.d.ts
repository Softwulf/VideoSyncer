declare namespace vsync {
    interface UninitializedProfile {
        name: string,
        startTime: number,
        endTime: number,
        currentTime: number,
        urlPattern: string,
        currentURL?: string,
        videoHost?: string,
        videoQuery?: string,
        nextHost?: string,
        nextQuery?: string,
        latestFrame?: string
    }

    interface Profile extends UninitializedProfile {
        key: string
    }
}

declare module 'semantic-ui-react';