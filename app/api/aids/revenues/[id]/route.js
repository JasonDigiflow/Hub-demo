import { NextResponse } from 'next/server';

// In-memory storage (shared with parent route)
let revenuesData = [];

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Find and update revenue
    const index = revenuesData.findIndex(r => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    revenuesData[index] = {
      ...revenuesData[index],
      ...data,
      id, // Preserve original ID
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      revenue: revenuesData[index] 
    });
  } catch (error) {
    console.error('Error updating revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Find and remove revenue
    const index = revenuesData.findIndex(r => r.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    revenuesData.splice(index, 1);

    return NextResponse.json({ 
      success: true,
      message: 'Revenue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}