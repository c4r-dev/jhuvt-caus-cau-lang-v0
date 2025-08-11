// models/Matrix.js
import mongoose, { Schema } from 'mongoose';

// Matrix Cell Schema
const matrixCellSchema = new Schema(
  {
    row: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    },
    column: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    },
    value: {
      type: Schema.Types.Mixed, // Allows any data type
      default: null
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// Version History Schema
const versionHistorySchema = new Schema(
  {
    version: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: String,
      default: ''
    },
    modifiedBy: {
      type: String,
      default: 'system'
    }
  },
  { _id: false }
);

// Matrix Data Schema
const matrixDataSchema = new Schema(
  {
    matrixId: {
      type: String,
      required: true,
      unique: true
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    dimensions: {
      rows: {
        type: Number,
        required: true,
        default: 15,
        enum: [15] // Enforces 15x15 matrix
      },
      columns: {
        type: Number,
        required: true,
        default: 15,
        enum: [15] // Enforces 15x15 matrix
      }
    },
    // Store matrix as array of arrays (15 rows, each with 15 columns)
    matrix: {
      type: [[Schema.Types.Mixed]], // Array of arrays
      required: true,
      validate: {
        validator: function(matrix) {
          // Validate 15x15 dimensions
          if (!Array.isArray(matrix) || matrix.length !== 15) {
            return false;
          }
          return matrix.every(row => 
            Array.isArray(row) && row.length === 15
          );
        },
        message: 'Matrix must be exactly 15x15 dimensions'
      },
      default: () => {
        // Initialize empty 15x15 matrix with null values
        return Array(15).fill().map(() => Array(15).fill(null));
      }
    },
    metadata: {
      title: {
        type: String,
        default: 'Untitled Matrix'
      },
      description: {
        type: String,
        default: ''
      },
      dataType: {
        type: String,
  enum: ['mixed', 'numerical', 'categorical', 'experimental'], // or similar
        default: 'mixed'
      },
      tags: [{
        type: String
      }]
    },
    versionHistory: [versionHistorySchema],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      default: 'system'
    },
    lastModifiedBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true,
    collection: 'matrices'
  }
);

// Pre-save middleware to update version history
matrixDataSchema.pre('save', function(next) {
  if (this.isModified('matrix') && !this.isNew) {
    this.version += 1;
    this.versionHistory.push({
      version: this.version,
      timestamp: new Date(),
      changes: 'Matrix data updated',
      modifiedBy: this.lastModifiedBy || 'system'
    });
  }
  next();
});

// Instance methods
matrixDataSchema.methods.getCellValue = function(row, column) {
  if (row >= 0 && row < 15 && column >= 0 && column < 15) {
    return this.matrix[row][column];
  }
  throw new Error('Invalid matrix coordinates');
};

matrixDataSchema.methods.setCellValue = function(row, column, value) {
  if (row >= 0 && row < 15 && column >= 0 && column < 15) {
    this.matrix[row][column] = value;
    this.markModified('matrix');
  } else {
    throw new Error('Invalid matrix coordinates');
  }
};

matrixDataSchema.methods.getRow = function(rowIndex) {
  if (rowIndex >= 0 && rowIndex < 15) {
    return this.matrix[rowIndex];
  }
  throw new Error('Invalid row index');
};

matrixDataSchema.methods.getColumn = function(columnIndex) {
  if (columnIndex >= 0 && columnIndex < 15) {
    return this.matrix.map(row => row[columnIndex]);
  }
  throw new Error('Invalid column index');
};

// Static methods
matrixDataSchema.statics.createEmptyMatrix = function(matrixId, options = {}) {
  const defaultMatrix = Array(15).fill().map(() => Array(15).fill(null));
  
  return new this({
    matrixId,
    matrix: defaultMatrix,
    metadata: {
      title: options.title || 'New Matrix',
      description: options.description || '',
      dataType: options.dataType || 'mixed',
      tags: options.tags || []
    },
    createdBy: options.createdBy || 'system',
    lastModifiedBy: options.createdBy || 'system'
  });
};

// Create compound indexes
matrixDataSchema.index({ matrixId: 1, version: -1 });
matrixDataSchema.index({ createdAt: -1 });
matrixDataSchema.index({ 'metadata.tags': 1 });

// Create model or use existing one
const Matrix = mongoose.models.Matrix || mongoose.model('Matrix', matrixDataSchema);

export default Matrix;