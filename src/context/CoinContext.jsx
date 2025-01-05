import React, { createContext, useContext, useEffect, useState } from "react";

export const CoinContext = createContext();

const CoinContextProvider = ({ children }) => {
    const [allCoin, setAllCoin] = useState([]); // Lista completa de monedas
    const [currency, setCurrency] = useState({
        id: 'argentino',
        name: 'Peso Argentino',
        symbol: 'ars',
        image: 'https://assets.coingecko.com/coins/images/37876/standard/arg_200x200.png?1715832878',
        current_price: 0, // Si lo necesitas para referencias
    });

    useEffect(() => {
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                "x-cg-demo-api-key": process.env.REACT_APP_COINGECKO_API_KEY,
            },
        };

        const fetchAllCoins = async () => {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`, options);
                const data = await response.json();

                if (Array.isArray(data)) {
                    // Agregar ARS al principio de la lista
                    setAllCoin([currency, ...data]); // Agrega ARS y luego las demás monedas
                }
            } catch (error) {
                console.error("Error fetching coins:", error);
            }
        };
        fetchAllCoins();
    }, [currency]);

    const contextValue = {
        allCoin,
        currency,
        setCurrency,
    };

    return <CoinContext.Provider value={contextValue}>{children}</CoinContext.Provider>;
};

export default CoinContextProvider;

// Hook para usar el contexto
export const useCoin = () => useContext(CoinContext);
