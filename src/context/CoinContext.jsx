import React, {createContext, useContext, useEffect, useState} from "react";

export const CoinContext = createContext();

const CoinContextProvider = ({ children }) => {
    const [allCoin, setAllCoin] = useState([]);
    const [currency, setCurrency] = useState({
        name: "Argentine Peso",
        symbol: "ARS",
        image: "https://coin-images.coingecko.com/coins/images/37876/thumb/arg_200x200.png?1715832878"
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

                // Nueva consulta para Argentina Coin
                const argentinaCoinResponse = await fetch('https://api.coingecko.com/api/v3/coins/argentinacoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false', options);
                const argentinaCoinData = await argentinaCoinResponse.json();
                console.log(argentinaCoinData); // Verifica la respuesta de Argentina Coin
                
                // Verifica si Argentina Coin ya está en la lista
                setAllCoin(prevCoins => {
                    if (!prevCoins.some(coin => coin.id === argentinaCoinData.id)) {
                        return [...prevCoins, argentinaCoinData]; // Agrega Argentina Coin a la lista si no existe
                    }
                    return prevCoins; // Retorna la lista sin cambios si ya existe
                });
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