import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url, 'http://localhost/'); // Provide a base URL to make it work in a non-browser context
    const accessToken = url.searchParams.get('access_token');
    console.log(accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Here you would exchange the access token for a session with Supabase
    // For demonstration, we will mock the session data
    const session = { accessToken: 'exampleAccessToken' };

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in set-cookie API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
