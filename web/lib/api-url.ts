/** Base URL of the NestJS API, for server-side calls only. */
export const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");
