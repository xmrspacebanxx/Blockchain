//BitcoinLTD Copyright (c) 2014-2024 The Bitcoin Limited developers
//Distributed under the MIT software license, see the accompanying
//file COPYING or http://www.opensource.org/licenses/mit-license.php.

const mongoose = require('mongoose');

const facturaSchema = new mongoose.Schema({
    numeroFactura: { type: String, required: true, unique: true },
    fechaEmision: { type: Date, required: true },
    cliente: {
        nombre: { type: String, required: true },
        direccion: { type: String, required: true },
        identificacionFiscal: { type: String, required: true }
    },
    items: [
        {
            descripcion: { type: String, required: true },
            cantidad: { type: Number, required: true },
            precioUnitario: { type: Number, required: true },
            totalItem: { type: Number, required: true }
        }
    ],
    subtotal: { type: Number, required: true },
    impuestos: { type: Number, required: true },
    total: { type: Number, required: true },
    estadoPago: { type: String, enum: ['pendiente', 'pagado', 'vencido'], default: 'pendiente' }
}, { timestamps: true });

module.exports = mongoose.model('Factura', facturaSchema);  
