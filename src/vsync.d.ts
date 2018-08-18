declare namespace VSync {

    interface SeriesBase {
        name: string

        host: string
        pathbase: string

        startTime: number
        endTime: number

        currentTime: number
        currentPath: string

        videoPlayer?: FrameElement
        nextButton?: FrameElement

        latestFrame?: string
    }

    interface Series extends SeriesBase {
        key: string
    }

    interface Settings {
        locale: string
        theme: string
    }

    interface FrameElement {
        host: string
        query: string
    }

    interface User {
        displayName: string
        photoURL: string
        uid: string
    }
}