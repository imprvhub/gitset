import type { APIContext } from "astro";
import { eq } from "drizzle-orm";
import { db } from "../../../../db";
import { sessions } from "../../../../db/schema";
import { revokeGithubToken, deleteOauthToken } from "../../../../lib/auth";

export async function POST({ cookies, locals }: APIContext) {
  const userId = locals.userId;
  const sessionToken = cookies.get("app_auth_token")?.value;

  if (!userId || !sessionToken) {
    return new Response(JSON.stringify({ error: "No authenticated session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const userInfo = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionToken),
      with: {
        user: {
          with: {
            oauthTokens: {
              columns: {
                strategy: true,
                accessToken: true,
              },
            },
          },
        },
      },
    });

    const githubToken = userInfo?.user?.oauthTokens?.find(token => token.strategy === 'github')?.accessToken;

    if (!githubToken) {
      return new Response(JSON.stringify({ error: "No GitHub token found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await revokeGithubToken(githubToken);

    await deleteOauthToken(userId, "github");

    cookies.delete("app_auth_token", { path: "/" });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error revoking GitHub token:", error);
    return new Response(JSON.stringify({ error: "Failed to revoke token" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}