import mongoose, { Schema, Document } from 'mongoose';

export interface IStockHistory extends Document {
  product: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeType: 'manual' | 'variant_manual' | 'order' | 'return' | 'adjustment' | 'initial';
  reason?: string;
  performedBy: mongoose.Types.ObjectId;
  performedAt: Date;
  notes?: string;
}

const stockHistorySchema = new Schema<IStockHistory>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  variantId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  changeAmount: {
    type: Number,
    required: true
  },
  changeType: {
    type: String,
    enum: ['manual', 'variant_manual', 'order', 'return', 'adjustment', 'initial'],
    required: true
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 200
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

stockHistorySchema.index({ product: 1, performedAt: -1 });
stockHistorySchema.index({ changeType: 1, performedAt: -1 });
stockHistorySchema.index({ performedBy: 1, performedAt: -1 });

const StockHistory = mongoose.model<IStockHistory>('StockHistory', stockHistorySchema);

export default StockHistory; 