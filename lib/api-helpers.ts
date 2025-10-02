import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Extract session token from request
 * Checks both cookies and Authorization header
 */
export async function getSessionTokenFromRequest(request?: NextRequest): Promise<string | null> {
  // Try to get from cookies first
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('cpn_session_token')?.value;

  if (sessionToken) {
    return sessionToken;
  }

  // Fallback to Authorization header if request is provided
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check x-session-token header
    const sessionHeader = request.headers.get('x-session-token');
    if (sessionHeader) {
      return sessionHeader;
    }
  }

  return null;
}
