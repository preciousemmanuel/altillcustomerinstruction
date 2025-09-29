import { SignJWT } from "jose";
import * as jose from "jose";

const secret = new TextEncoder().encode(import.meta.env.VITE_SECRETKEY);

export async function generateKey(data: Record<string, unknown>) {
  const token = await new SignJWT(data) // details to encode in the token
    .setProtectedHeader({ alg: "HS256" }) // algorithm
    .sign(secret); // secretKey generated from previous step
  return token;
}

export async function generateforString(data: any) {
  const token = await new SignJWT({ data }) // details to  encode in the token
    .setProtectedHeader({ alg: 'HS256' }) // algorithm
    .sign(secret);
  return token
}

export async function decodeKey(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    if (typeof token !== "string") {
      console.error("Invalid token format. Token must be a string.");
      return null;
    }

    const { payload } = await jose.jwtVerify(token, secret);
    const normalizedPayload = toLowerCaseKeys(payload);

    return normalizedPayload;
  } catch (err) {
    console.error("Invalid token or secret", err);
    return null;
  }
}

export async function decodeData(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    if (typeof token !== "string") {
      console.error("Invalid token format. Token must be a string.");
      return null;
    }

    const { payload } = await jose.jwtVerify(token, secret);

    // Function to lowercase only the first letter of a string
    function lowercaseFirstLetter(str: string): string {
      if (!str) return "";
      return str.charAt(0).toLowerCase() + str.slice(1);
    }

    // Normalize payload keys
    const normalizedPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [
        lowercaseFirstLetter(key),
        value,
      ])
    );

    return normalizedPayload;
  } catch (err) {
    console.error("Invalid token or secret", err);
    return null;
  }
}

function _toLowerCaseKeys<T extends Record<string, any>>(
  obj: T,
  visited: Set<any>
): T {
  if (visited.has(obj)) {
    return obj; // Circular reference detected, return object as is.
  }
  if(obj) visited.add(obj);

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.toLowerCase(),
      value && typeof value === "object" && !Array.isArray(value)
        ? _toLowerCaseKeys(value, visited)
        : value,
    ])
  ) as T;
}


export function toLowerCaseKeys<T extends Record<string, any>>(obj: T): T {
  if(!obj) return obj
  return _toLowerCaseKeys(obj, new Set());
}


export function toUpperCaseKeys<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.toLowerCase(),
      value && typeof value === "object" && !Array.isArray(value)
        ? toLowerCaseKeys(value)
        : value,
    ])
  ) as T;
}