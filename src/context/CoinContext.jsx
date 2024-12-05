import React, {createContext, useContext, useEffect, useState} from "react";

export const CoinContext = createContext();

const CoinContextProvider = ({ children }) => {
    const [allCoin, setAllCoin] = useState([]);
    const [currency, setCurrency] = useState({
        name: "ars",
        symbol: "ars"
    });

    useEffect(() => {
        const fetchAllCoin = async () => {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-cg-demo-api-key': 'CG-PneVfGH7AnPLhBT14TwYBTN9'
                }
            };
        
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=ars', options);
                const data = await response.json();
                console.log(data); // Asegúrate que estás viendo la respuesta correcta
                setAllCoin(data);  // Aquí asignamos correctamente la lista de monedas
            } catch (error) {
                console.error("Error fetching coins:", error);
            }
        };        

        fetchAllCoin();
    }, [currency]);

    const contextValue = {allCoin, currency, setCurrency}

    return (
        <CoinContext.Provider value={contextValue}>
            {children}
        </CoinContext.Provider>
    ) 
}

export default CoinContextProvider;

// Hook para usar el contexto
export const useCoin = () => {
    return useContext(CoinContext);
};