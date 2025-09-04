import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Disconnected from Meta'
    });

    // Clear all Meta-related cookies
    response.cookies.delete('meta_connection');
    response.cookies.delete('meta_cache');
    response.cookies.delete('meta_oauth_state');

    return response;
  } catch (error) {
    console.error('Error disconnecting from Meta:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}