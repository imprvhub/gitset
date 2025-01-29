import { defineMiddleware } from "astro/middleware";
import getUser from "./lib/getUser";


export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("app_auth_token")?.value;
  const userInfo = await getUser(token);

  context.locals.userId = userInfo?.user?.id;

  const pathname = context.url.pathname;
  if (typeof pathname !== 'string') {
    console.error('Invalid pathname:', pathname);
    return new Response('Invalid pathname', { status: 404 });
  }

  if (pathname === '/404') {
    return next();
  }

  if (
    pathname.includes("dashboard") ||
    pathname.includes("pricing") ||  
    pathname.includes("settings") || 
    pathname.includes("tags-releases") || 
    pathname.includes("personal-ai-readme") ||
    pathname.includes("cli-assistant") ||
    pathname.includes("public-ai-readme") ||
    pathname.includes("dependencies-handler") ||
    pathname.includes("repository-assessment") ||
    pathname.includes("code-decommenter") ||
    pathname.includes("commit-messages")
  ) {
    if (!userInfo || !userInfo.user) {
      return context.redirect("/login");
    }
  }

  if (pathname.includes("login") || pathname.includes("signup")) {
    if (userInfo?.user) {
      return context.redirect("/dashboard");
    }
  }

  if (pathname === "/logout") {
    context.cookies.delete("app_auth_token", { path: '/' });
    return context.redirect("/");
  }

  const response = await next();

  if (response.status === 404 && pathname !== '/404') {
    return context.redirect('/404');
  }

  return response;
});