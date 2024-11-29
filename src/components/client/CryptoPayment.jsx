import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import ABI from '../contracts/abi.json';

const CryptoPayment = ({ totalCompraRedondeado, comercio }) => {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const provider = await detectEthereumProvider();
                
                if (provider) {
                    const accounts = await window.ethereum.request({
                        method: 'eth_accounts'
                    });
                    
                    if (accounts.length > 0) {
                        setProvider(new ethers.BrowserProvider(window.ethereum));
                        setAccount(accounts[0]);
                    }
                }
            } catch (error) {
                console.error('Error al verificar conexión con MetaMask:', error);
            }
        };

        checkConnection();
    }, []);

    const conectarWallet = async () => {
        try {
            const provider = await detectEthereumProvider();
            
            if (provider) {
                setProvider(new ethers.BrowserProvider(window.ethereum));
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                setAccount(accounts[0]);
            } else {
                alert('Por favor, instala MetaMask!');
            }
        } catch (error) {
            console.error('Error al conectar con MetaMask:', error);
            alert('Error al conectar con MetaMask');
        }
    };

    const onPayWithCrypto = async () => {
        try {
            if (!provider || !comercio?.public_key || !CONTRACT_ADDRESS) {
                alert('Faltan datos necesarios para el pago');
                return;
            }

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                ABI,
                signer
            );

            const amountInWei = ethers.parseEther(totalCompraRedondeado.toString());

            const tx = await contract.dividirPagoBNB(
                comercio.public_key,
                {
                    value: amountInWei,
                    gasLimit: 300000
                }
            );

            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                alert(`¡Pago exitoso! Hash de transacción: ${tx.hash}`);
            } else {
                alert('La transacción falló');
            }

        } catch (error) {
            console.error('Error en el pago:', error);
            alert(`Error al procesar el pago: ${error.message}`);
        }
    };

    return (
        <div>
            {!account ? (
                <button 
                    className="btn btn-warning"
                    onClick={conectarWallet}
                >
                    Conectar con MetaMask
                </button>
            ) : (
                <div>
                    <button
                        className="btn btn-success"
                        onClick={onPayWithCrypto}
                        disabled={!provider || !comercio?.public_key || !CONTRACT_ADDRESS}
                    >
                        Pagar {totalCompraRedondeado} BNB
                    </button>
                    
                    {(!provider || !comercio?.public_key || !CONTRACT_ADDRESS) && (
                        <div className="text-danger mt-2 small">
                            {!provider && "No se detectó el proveedor de MetaMask. "}
                            {!comercio?.public_key && "El comercio no tiene configurada una billetera. "}
                            {!CONTRACT_ADDRESS && "No se ha configurado la dirección del contrato. "}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CryptoPayment;
