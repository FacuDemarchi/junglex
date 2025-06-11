import React, { useState, useRef, useEffect } from "react";
import { useCoin } from "../../context/CoinContext";
import styles from "./styles/AllCoinDropdown.module.css";

const AllCoinDropdown = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { currency, setCurrency, allCoin } = useCoin();

    const filteredCoins = allCoin.filter(coin => {
        const term = searchTerm.toLowerCase();
        return [coin.id, coin.symbol, coin.name].some(attr => attr.toLowerCase().includes(term));
    });

    const handleSelect = (coin) => {
        setCurrency({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            current_price: coin.current_price
        });
        setIsOpen(false);
    };

    // Cerrar el dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button 
                className={styles.dropdownToggle}
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={currency.image} alt=" " className={styles.coinIcon} />
                {currency.name} {currency.symbol}
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    <input
                        type="text"
                        placeholder="Buscar moneda..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <div className={styles.coinsList}>
                        {filteredCoins.length ? (
                            filteredCoins.map(coin => (
                                <button
                                    key={coin.id}
                                    className={styles.coinItem}
                                    onClick={() => handleSelect(coin)}
                                >
                                    <img src={coin.image} alt={coin.name} className={styles.coinIcon} />
                                    {coin.name}
                                </button>
                            ))
                        ) : (
                            <div className={styles.noCoins}>No hay monedas disponibles</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllCoinDropdown;
