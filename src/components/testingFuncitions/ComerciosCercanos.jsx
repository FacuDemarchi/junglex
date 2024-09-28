import React, { useState, useEffect } from 'react';

// Función Haversine para calcular la distancia entre dos puntos (en km)
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ComerciosCercanos = ({ clienteUbicacion, radioBusqueda }) => {
    // Datos de ejemplo de comercios
    const [comercios, setComercios] = useState([
        { nombre: "Comercio 1", lat: -34.6037, lon: -58.3816, maxEntrega: 6 }, // Entrega hasta 6 km
        { nombre: "Comercio 2", lat: -34.611, lon: -58.3775, maxEntrega: 3 }, // Entrega hasta 3 km
        { nombre: "Comercio 3", lat: -34.620, lon: -58.3700, maxEntrega: 5 }  // Entrega hasta 5 km
    ]);

    // Estado para almacenar comercios cercanos
    const [comerciosCercanos, setComerciosCercanos] = useState([]);

    useEffect(() => {
        // Filtra los comercios según la distancia y el radio máximo de entrega
        const filteredComercios = comercios.filter(comercio => {
            const distancia = haversine(clienteUbicacion.lat, clienteUbicacion.lon, comercio.lat, comercio.lon);
            return distancia <= Math.min(radioBusqueda, comercio.maxEntrega);
        });

        setComerciosCercanos(filteredComercios);
    }, [clienteUbicacion, radioBusqueda, comercios]);

    return (
        <div>
            <h3>Comercios cercanos a tu ubicación</h3>
            {comerciosCercanos.length > 0 ? (
                <ul>
                    {comerciosCercanos.map((comercio, index) => (
                        <li key={index}>
                            {comercio.nombre} - Distancia máxima de entrega: {comercio.maxEntrega} km
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay comercios cercanos en el rango seleccionado.</p>
            )}
        </div>
    );
};

export default ComerciosCercanos;
