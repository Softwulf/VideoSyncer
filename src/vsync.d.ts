declare namespace vsync {
    interface Profile {
        key: string,
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

    class Profile implements Profile {
    }
}

declare module 'semantic-ui-react';