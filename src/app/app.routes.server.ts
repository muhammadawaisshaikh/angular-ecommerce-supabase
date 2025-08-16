import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Single catch-all route to handle all paths
  // This avoids prerendering issues while ensuring all routes are known to Angular
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
