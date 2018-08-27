export const secondsToHms = (seconds: number): string => {
    const d = Number(seconds);
    
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);
    
    return (h > 0 ? ('0' + h).slice(-2) + ':' : '') + ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
}

export const shorten = (msg: string, len: number): string => {
    const shortened = msg.substring(msg.length-(len-3), msg.length);
    if(shortened.length === msg.length) return msg;
    return '...'+shortened
}