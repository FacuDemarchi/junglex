import React, { createContext, useContext, useEffect, useState } from "react";

export const CoinContext = createContext();

const CoinContextProvider = ({ children }) => {
    const [allCoin, setAllCoin] = useState([]);
    const [currency, setCurrency] = useState({
        id: 'argentino',
        name: 'Peso Argentino',
        symbol: 'ars',
        image: 'https://assets.coingecko.com/coins/images/37876/standard/arg_200x200.png?1715832878',
        current_price: 0
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
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.symbol}`, options);
                const data = await response.json();

                if (Array.isArray(data)) {
                    setAllCoin(data);
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
        setCurrency
    };

    return <CoinContext.Provider value={contextValue}>{children}</CoinContext.Provider>;
};

export default CoinContextProvider;

// Hook para usar el contexto
export const useCoin = () => useContext(CoinContext);
