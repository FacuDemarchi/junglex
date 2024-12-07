import React, { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useCoin } from "../../context/CoinContext";

const AllCoinDropdown = ({ onCurrencyChange }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const { currency, setCurrency, allCoin } = useCoin();

    const filteredCoins = allCoin.filter(coin => {
        const term = searchTerm.toLowerCase();
        return [coin.id, coin.symbol, coin.name].some(attr => attr.toLowerCase().includes(term));
    });

    return (
        <Dropdown className="ms-2">
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                <img src={currency.image} alt=" " style={{ width: "20px", height: "20px", marginRight: "5px" }} />
                {currency.name} {currency.symbol}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <input
                    type="text"
                    placeholder="Buscar moneda..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    style={{ margin: "10px", padding: "5px", width: "90%" }}
                />
                {filteredCoins.length ? (
                    filteredCoins.map(coin => (
                        <Dropdown.Item key={coin.id} onClick={() => {
                            onCurrencyChange(coin);
                            setCurrency({
                                id: coin.id,
                                name: coin.name,
                                symbol: coin.symbol,
                                image: coin.image,
                                current_price: coin.current_price
                            });
                        }}>
                            <img src={coin.image} alt={coin.name} style={{ width: "20px", height: "20px", marginRight: "5px" }} />
                            {coin.name}
                        </Dropdown.Item>
                    ))
                ) : (
                    <Dropdown.Item disabled>No hay monedas disponibles</Dropdown.Item>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default AllCoinDropdown;
