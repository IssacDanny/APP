// src/utils.ts
export function interpolateTitle(template: string, data: Record<string, any>): string {
  if (!data) return template;
  return template.replace(/{(\w+)}/g, (_, key) => data[key] || '');
}