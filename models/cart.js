const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ 
        productId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }]
});

module.exports = mongoose.model('Cart', cartSchema);
