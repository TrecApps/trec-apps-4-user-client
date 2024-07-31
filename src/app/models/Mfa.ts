
export interface MfaRegistrationData {
    userCode: string;
    qrCode: string;
}

export interface MfaSubmission {
    code: string;
    type: string;
}