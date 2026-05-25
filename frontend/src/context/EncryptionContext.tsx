import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface EncryptionContextType {
    encryptionKey: CryptoKey | null;
    setEncryptionKey: (key: CryptoKey | null) => void;
    hasKey: boolean;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export const EncryptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

    return (
        <EncryptionContext.Provider
            value={{
                encryptionKey,
                setEncryptionKey,
                hasKey: encryptionKey !== null,
            }}
        >
            {children}
        </EncryptionContext.Provider>
    );
};

export const useEncryption = () => {
    const context = useContext(EncryptionContext);
    if (context === undefined) {
        throw new Error('useEncryption must be used within an EncryptionProvider');
    }
    return context;
};
