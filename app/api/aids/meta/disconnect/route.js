import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Clear all Meta-related cookies
    cookieStore.delete('meta_session');
    cookieStore.delete('selected_ad_account');
    
    // In production, also:
    // - Revoke token via Facebook API
    // - Delete from database
    // - Clean up any cached data

    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected from Meta'
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json({ 
      error: 'Failed to disconnect',
      details: error.message 
    }, { status: 500 });
  }
}