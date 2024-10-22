export interface Address {
    country: string;
    region: string;
    township: string;
    
    address1: string;
    
    address2: string | undefined;
    postCode: string;
}