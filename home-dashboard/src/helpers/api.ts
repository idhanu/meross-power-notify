const basePath = window.location.host.includes("localhost")
  ? "http://localhost:22000"
  : "";

export const request = async <T = unknown>(
  path: string,
  info?: RequestInit
) => {
  const url = `${basePath}${path}`;
  const response = await fetch(url, info);
  return (await response.json()) as T;
};
