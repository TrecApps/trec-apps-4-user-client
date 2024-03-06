export class Session {
    expiration : Date | undefined;
    appId : string | undefined;
    sessionId : string | undefined;
    deviceInfo: string | undefined;
}

export class SessionList {
    sessions: Session[];

    AlphaNumericString: string | undefined;
    RANDOM_STRING_LENGTH: number | undefined;

    constructor(sessions: Session[]) {
        this.sessions = sessions;
    }
}