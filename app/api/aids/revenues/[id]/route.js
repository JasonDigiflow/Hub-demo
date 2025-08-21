import { NextResponse } from 'next/server';
import { revenueService } from '@/lib/aids/revenueService';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Update revenue using service
    const success = await revenueService.update(id, data);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      usingFirebase: revenueService.isFirebaseAvailable()
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
    
    // Delete revenue using service
    const success = await revenueService.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Revenue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Revenue deleted successfully',
      usingFirebase: revenueService.isFirebaseAvailable()
    });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}