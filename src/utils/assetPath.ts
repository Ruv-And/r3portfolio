// Utility function to resolve asset paths correctly for both dev and production
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, use the path as-is with leading slash
  // In production, the base path will be automatically prepended by Vite
  return `/${cleanPath}`;
}

export default getAssetPath;
