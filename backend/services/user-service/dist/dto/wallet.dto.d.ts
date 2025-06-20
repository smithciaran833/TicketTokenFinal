export declare class CreateWalletDto {
    userId: string;
    email: string;
    walletType: 'CUSTODIAL' | 'PHANTOM';
}
export declare class ConnectPhantomDto {
    userId: string;
    phantomPublicKey?: string;
    phantomWallet?: string;
    signature: string;
}
export declare class MigrateWalletDto {
    userId: string;
    targetWallet: string;
}
export declare class WalletBalanceDto {
    balance: number;
    walletAddress: string;
    formatted?: string;
}
