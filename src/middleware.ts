import { defineMiddleware } from "astro/middleware";
import getUser from "./lib/getUser";

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("app_auth_token")?.value;
  const userInfo = await getUser(token);

  context.locals.userId = userInfo?.user?.id;

  const pathname = context.url.pathname;
  if (typeof pathname !== 'string') {
    console.error('Invalid pathname:', pathname);
    return context.redirect('/error');
  }

  if (
    pathname.includes("dashboard") || 
    pathname.includes("settings") || 
    pathname.includes("tags-releases") || 
    pathname.includes("personal-ai-readme")
  ) {
    if (!userInfo || !userInfo.user) {
      return context.redirect("/login");
    } else {
      return next();
    }
  }
  

  if (pathname.includes("login")) {
    if (userInfo?.user) {
      return context.redirect("/dashboard");
    }
  }

  if (pathname === "/logout") {
    context.cookies.delete("app_auth_token", { path: '/' });
    return context.redirect("/");
  }

  return next();
});