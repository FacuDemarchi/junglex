import React, { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, parseUnits } from 'ethers';

// CriptoPayment maneja toda la logica relacionada con el uso de cryptomonedas, incluyendo la detección de Metamask, la configuración con el proveedor y la realización de la transacción

const CryptoPayment = ({ totalCompraRedondeado }) => {
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        const initMetamask = async () => {
            const detectProvider = await detectEthereumProvider();
            if (detectProvider) {
                setProvider(new BrowserProvider(detectProvider));
            }
        };
        initMetamask();
    }, []);

    const onPayWithCrypto = async () => {
        const signer = provider.getSigner();
        try {
            const valueInWei = parseUnits(totalCompraRedondeado.toString(), 'ether');
            const transaction = await signer.sendTransaction({
                to: 'DIRECCION_DEL_COMERCIO', 
                value: valueInWei
            });
            alert(`Transacción enviada! Hash: ${transaction.hash}`);
        } catch (error) {
            console.error('Error al realizar el pago:', error.message);
            alert('Error al realizar el pago.');
        }
    };

    return (
        provider && (
            <button
                className="btn btn-warning"
                onClick={onPayWithCrypto}
                disabled={!provider}
            >
                Cripto pay
            </button>
        )
    );
};

export default CryptoPayment;
