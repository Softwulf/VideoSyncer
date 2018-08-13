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

    interface Settings {
        locale: string
        theme: string
    }
}