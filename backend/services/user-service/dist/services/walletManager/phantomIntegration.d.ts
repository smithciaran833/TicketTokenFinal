export declare class PhantomIntegrationService {
    private logger;
    generateConnectUrl(data: {
        userId: string;
        redirectUrl: string;
        cluster?: 'mainnet-beta' | 'testnet' | 'devnet';
    }): string;
    validatePhantomWallet(walletAddress: string): {
        isValid: boolean;
        error?: string;
    };
    verifyWalletOwnership(walletAddress: string, signedMessage: string, expectedMessage: string): Promise<boolean>;
    generateSignInMessage(data: {
        walletAddress: string;
        timestamp: number;
        nonce: string;
    }): string;
    private generateSessionId;
    generatePhantomUniversalLink(action: 'connect' | 'signMessage' | 'signTransaction', params: any): string;
    checkPhantomInstalled(userAgent: string): Promise<{
        isInstalled: boolean;
        platform?: 'ios' | 'android' | 'desktop' | 'unknown';
    }>;
}
