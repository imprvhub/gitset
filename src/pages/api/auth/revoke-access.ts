import type { APIContext } from "astro";
import { db } from "../../../db";
import { sessions } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST({ request }: APIContext) {
  try {
    const { sessionId }: { sessionId: string } = await request.json();
    
    if (!sessionId) {
      return Response.json({ success: false, error: 'Invalid session ID' }, { status: 400 });
    }

    const sessionExists = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId)
    });

    if (!sessionExists) {
      return Response.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return Response.json({ success: true });

  } catch (error) {
    console.error('Error revoking session:', error);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}