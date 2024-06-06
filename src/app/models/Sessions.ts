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


export class SessionApp {
    app: string;
    brandId: string | undefined;

    constructor(app: string, brandId: string| undefined) {
        this.app = app;
        this.brandId = brandId;
    }
}

export class SessionV2 {
    deviceId: string = "";
    expiration : Date | undefined;
    expirationStr: string | undefined;
    deviceInfo: string | undefined;
    apps: SessionApp[] = [];
    blockedApps: string[] = [];
}

export class SessionListV2 {
    sessions: SessionV2[] = [];
}