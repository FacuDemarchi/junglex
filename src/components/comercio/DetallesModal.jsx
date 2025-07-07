import React from 'react';

const DetallesModal = ({ detalles, mostrar, onClose }) => {
    if (!mostrar) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Detalles del Pedido</h2>
                    <button
                        className="text-gray-400 hover:text-gray-700 text-xl font-bold focus:outline-none"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>
                <div className="px-4 py-3">
                    <ul className="space-y-1">
                        {detalles && detalles.map(({ productos, cantidad }, idx) => (
                            <li key={idx} className="text-sm text-gray-700">
                                {cantidad}x {productos.nombre} - ${productos.precio.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-end px-4 py-3 border-t border-gray-200">
                    <button
                        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetallesModal;
