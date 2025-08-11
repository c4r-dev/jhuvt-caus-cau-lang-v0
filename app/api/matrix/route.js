import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb';
import Matrix from '../models/Matrix';

export async function POST(req) {
  try {
    await connectMongoDB();
    
    // Parse request body
    const body = await req.json();
    const { 
      matrixId, 
      matrix, 
      metadata = {}, 
      lastModifiedBy = 'system',
      changes = 'Matrix data updated'
    } = body;
    
    // Validate required fields
    if (!matrixId) {
      return NextResponse.json(
        { message: 'matrixId is required' },
        { status: 400 }
      );
    }
    
    if (!matrix) {
      return NextResponse.json(
        { message: 'matrix data is required' },
        { status: 400 }
      );
    }
    
    // Validate matrix dimensions
    if (!Array.isArray(matrix) || matrix.length !== 15) {
      return NextResponse.json(
        { message: 'Matrix must have exactly 15 rows' },
        { status: 400 }
      );
    }
    
    const isValidMatrix = matrix.every(row => 
      Array.isArray(row) && row.length === 15
    );
    
    if (!isValidMatrix) {
      return NextResponse.json(
        { message: 'Matrix must be 15x15 - each row must have exactly 15 columns' },
        { status: 400 }
      );
    }
    
    // Find the matrix or create it if it doesn't exist
    let matrixDoc = await Matrix.findOne({ matrixId });
    
    const currentTime = new Date();
    
    if (!matrixDoc) {
      // Create a new matrix if it doesn't exist
      matrixDoc = new Matrix({
        matrixId,
        matrix,
        metadata: {
          title: metadata.title || 'New Matrix',
          description: metadata.description || '',
          dataType: metadata.dataType || 'mixed',
          tags: metadata.tags || []
        },
        createdBy: lastModifiedBy,
        lastModifiedBy,
        versionHistory: [{
          version: 1,
          timestamp: currentTime,
          changes: 'Matrix created',
          modifiedBy: lastModifiedBy
        }]
      });
    } else {
      // Update existing matrix
      const oldVersion = matrixDoc.version;
      
      // Update matrix data
      matrixDoc.matrix = matrix;
      matrixDoc.lastModifiedBy = lastModifiedBy;
      
      // Update metadata if provided
      if (metadata.title !== undefined) {
        matrixDoc.metadata.title = metadata.title;
      }
      if (metadata.description !== undefined) {
        matrixDoc.metadata.description = metadata.description;
      }
      if (metadata.dataType !== undefined) {
        matrixDoc.metadata.dataType = metadata.dataType;
      }
      if (metadata.tags !== undefined) {
        matrixDoc.metadata.tags = metadata.tags;
      }
      
      // Version will be incremented automatically by pre-save middleware
      // But we can manually add to version history with custom changes message
      matrixDoc.versionHistory.push({
        version: oldVersion + 1,
        timestamp: currentTime,
        changes,
        modifiedBy: lastModifiedBy
      });
    }
    
    // Save the matrix
    await matrixDoc.save();
    
    return NextResponse.json(
      { 
        message: `Matrix '${matrixId}' saved successfully`,
        matrixId: matrixDoc.matrixId,
        version: matrixDoc.version,
        dimensions: matrixDoc.dimensions,
        lastModified: matrixDoc.updatedAt
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving matrix:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          message: 'Validation Error', 
          error: error.message,
          details: Object.values(error.errors).map(err => err.message)
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'Matrix with this ID already exists in this version' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE route to delete matrix data
export async function DELETE(req) {
  try {
    await connectMongoDB();
    
    // Parse request body or query parameters
    const { searchParams } = new URL(req.url);
    let body = {};
    
    try {
      // Try to parse body if it exists
      const requestBody = await req.text();
      if (requestBody) {
        body = JSON.parse(requestBody);
      }
    } catch (e) {
      // If no body, use query parameters
    }
    
    // Get parameters from body or URL params
    const matrixId = body.matrixId || searchParams.get('matrixId');
    const version = body.version || searchParams.get('version');
    const deleteType = body.deleteType || searchParams.get('deleteType') || 'soft'; // 'soft' or 'hard'
    const deletedBy = body.deletedBy || searchParams.get('deletedBy') || 'system';
    const reason = body.reason || searchParams.get('reason') || 'Matrix deletion requested';
    
    // Validate required fields
    if (!matrixId) {
      return NextResponse.json(
        { message: 'matrixId is required' },
        { status: 400 }
      );
    }
    
    const currentTime = new Date();
    
    // Handle specific version deletion
    if (version) {
      const versionNumber = parseInt(version);
      
      if (isNaN(versionNumber) || versionNumber < 1) {
        return NextResponse.json(
          { message: 'Invalid version number' },
          { status: 400 }
        );
      }
      
      // Find the specific version
      const matrixDoc = await Matrix.findOne({ 
        matrixId, 
        version: versionNumber 
      });
      
      if (!matrixDoc) {
        return NextResponse.json(
          { message: `Matrix '${matrixId}' version ${versionNumber} not found` },
          { status: 404 }
        );
      }
      
      // Check if this is the only version
      const totalVersions = await Matrix.countDocuments({ matrixId });
      
      if (totalVersions === 1) {
        return NextResponse.json(
          { 
            message: 'Cannot delete the only version of a matrix. Use deleteType=hard to delete entire matrix.',
            suggestion: 'Use DELETE without version parameter to delete entire matrix'
          },
          { status: 400 }
        );
      }
      
      if (deleteType === 'soft') {
        // Soft delete: mark as inactive
        matrixDoc.isActive = false;
        matrixDoc.lastModifiedBy = deletedBy;
        matrixDoc.versionHistory.push({
          version: matrixDoc.version,
          timestamp: currentTime,
          changes: `Version ${versionNumber} soft deleted - ${reason}`,
          modifiedBy: deletedBy
        });
        
        await matrixDoc.save();
        
        return NextResponse.json(
          { 
            message: `Matrix '${matrixId}' version ${versionNumber} marked as inactive`,
            matrixId,
            version: versionNumber,
            deleteType: 'soft',
            deletedBy,
            deletedAt: currentTime
          },
          { status: 200 }
        );
      } else {
        // Hard delete: remove from database
        await Matrix.findOneAndDelete({ matrixId, version: versionNumber });
        
        return NextResponse.json(
          { 
            message: `Matrix '${matrixId}' version ${versionNumber} permanently deleted`,
            matrixId,
            version: versionNumber,
            deleteType: 'hard',
            deletedBy,
            deletedAt: currentTime
          },
          { status: 200 }
        );
      }
    }
    
    // Handle entire matrix deletion (all versions)
    const matrixDocs = await Matrix.find({ matrixId });
    
    if (!matrixDocs || matrixDocs.length === 0) {
      return NextResponse.json(
        { message: `Matrix '${matrixId}' not found` },
        { status: 404 }
      );
    }
    
    const totalVersions = matrixDocs.length;
    
    if (deleteType === 'soft') {
      // Soft delete: mark all versions as inactive
      const updateResult = await Matrix.updateMany(
        { matrixId },
        { 
          $set: { 
            isActive: false,
            lastModifiedBy: deletedBy
          },
          $push: {
            versionHistory: {
              version: { $max: "$version" },
              timestamp: currentTime,
              changes: `Matrix soft deleted - ${reason}`,
              modifiedBy: deletedBy
            }
          }
        }
      );
      
      return NextResponse.json(
        { 
          message: `Matrix '${matrixId}' marked as inactive`,
          matrixId,
          totalVersions,
          versionsAffected: updateResult.modifiedCount,
          deleteType: 'soft',
          deletedBy,
          deletedAt: currentTime
        },
        { status: 200 }
      );
    } else {
      // Hard delete: remove all versions from database
      const deleteResult = await Matrix.deleteMany({ matrixId });
      
      return NextResponse.json(
        { 
          message: `Matrix '${matrixId}' permanently deleted`,
          matrixId,
          totalVersions,
          versionsDeleted: deleteResult.deletedCount,
          deleteType: 'hard',
          deletedBy,
          deletedAt: currentTime
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error deleting matrix:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { message: 'Invalid matrix ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// GET route to retrieve matrix data
export async function GET(req) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(req.url);
    const matrixId = searchParams.get('matrixId');
    const version = searchParams.get('version');
    const includeHistory = searchParams.get('includeHistory') === 'true';
    
    if (!matrixId) {
      return NextResponse.json(
        { message: 'matrixId parameter is required' },
        { status: 400 }
      );
    }
    
    let query = { matrixId };
    if (version) {
      query.version = parseInt(version);
    }
    
    // Find the matrix (latest version if no version specified)
    let matrixDoc = await Matrix.findOne(query).sort({ version: -1 });
    
    if (!matrixDoc) {
      return NextResponse.json(
        { message: `Matrix '${matrixId}' not found` },
        { status: 404 }
      );
    }
    
    // Prepare response data
    const responseData = {
      matrixId: matrixDoc.matrixId,
      version: matrixDoc.version,
      dimensions: matrixDoc.dimensions,
      matrix: matrixDoc.matrix,
      metadata: matrixDoc.metadata,
      isActive: matrixDoc.isActive,
      createdBy: matrixDoc.createdBy,
      lastModifiedBy: matrixDoc.lastModifiedBy,
      createdAt: matrixDoc.createdAt,
      updatedAt: matrixDoc.updatedAt
    };
    
    // Include version history if requested
    if (includeHistory) {
      responseData.versionHistory = matrixDoc.versionHistory;
    }
    
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Error retrieving matrix:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT route to update specific matrix cells
export async function PUT(req) {
  try {
    await connectMongoDB();
    
    const body = await req.json();
    const { 
      matrixId, 
      cellUpdates, // Array of {row, column, value} objects
      lastModifiedBy = 'system',
      changes = 'Cell values updated'
    } = body;
    
    if (!matrixId || !cellUpdates || !Array.isArray(cellUpdates)) {
      return NextResponse.json(
        { message: 'matrixId and cellUpdates array are required' },
        { status: 400 }
      );
    }
    
    // Find the matrix
    let matrixDoc = await Matrix.findOne({ matrixId });
    
    if (!matrixDoc) {
      return NextResponse.json(
        { message: `Matrix '${matrixId}' not found` },
        { status: 404 }
      );
    }
    
    // Update individual cells
    let updatedCells = 0;
    for (const update of cellUpdates) {
      const { row, column, value } = update;
      
      // Validate coordinates
      if (row < 0 || row >= 15 || column < 0 || column >= 15) {
        return NextResponse.json(
          { message: `Invalid coordinates: row ${row}, column ${column}` },
          { status: 400 }
        );
      }
      
      // Update the cell
      matrixDoc.matrix[row][column] = value;
      updatedCells++;
    }
    
    // Mark matrix as modified and update metadata
    matrixDoc.markModified('matrix');
    matrixDoc.lastModifiedBy = lastModifiedBy;
    
    // Add to version history
    const currentTime = new Date();
    matrixDoc.versionHistory.push({
      version: matrixDoc.version + 1,
      timestamp: currentTime,
      changes: `${changes} - Updated ${updatedCells} cells`,
      modifiedBy: lastModifiedBy
    });
    
    // Save the matrix
    await matrixDoc.save();
    
    return NextResponse.json(
      { 
        message: `Successfully updated ${updatedCells} cells in matrix '${matrixId}'`,
        matrixId: matrixDoc.matrixId,
        version: matrixDoc.version,
        updatedCells
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating matrix cells:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}