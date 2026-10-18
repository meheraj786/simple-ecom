export function getAllowedOrigins(
  clientUrl: string | undefined,
  frontendUrl: string | undefined,
): string[] {
  const clientOrigins = (clientUrl ?? "http://localhost:3000").split(",");
  const frontendOrigins = (frontendUrl ?? "").split(",");

  return [...clientOrigins, ...frontendOrigins]
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}
