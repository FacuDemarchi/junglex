import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import ABI from '../contracts/abi.json';

const CryptoPayment = ({ totalCompraRedondeado, comercio }) => {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

    useEffect(() => {
        const initMetamask = async () => {
            try {
                const provider = await detectEthereumProvider();
                
                if (provider) {
                    setProvider(new ethers.BrowserProvider(window.ethereum));
                    // Solicitar conexión a MetaMask
                    const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts'
                    });
                    setAccount(accounts[0]);
                } else {
                    alert('Por favor, instala MetaMask!');
                }
            } catch (error) {
                console.error('Error al inicializar MetaMask:', error);
            }
        };

        initMetamask();
    }, []);

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
                    onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}
                >
                    Conectar Wallet
                </button>
            ) : (
                <button
                    className="btn btn-warning"
                    onClick={onPayWithCrypto}
                    disabled={!provider || !comercio?.public_key || !CONTRACT_ADDRESS}
                >
                    Pagar con Crypto
                </button>
            )}
        </div>
    );
};

export default CryptoPayment;
