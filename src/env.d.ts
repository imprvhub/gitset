/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    userId: string | undefined;
    userPlan: 'basic' | 'pro';
    userEmail: string | undefined;
  }
}

declare namespace Astro {
  interface APIContext {
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string, options?: any): void;
      delete(name: string, options?: any): void;
    };
    redirect(path: string, status?: number): Response;
  }
}