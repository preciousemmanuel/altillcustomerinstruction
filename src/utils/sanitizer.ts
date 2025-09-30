import DOMPurify from "dompurify";

// export const sanitizeInput = (input: string) => !input ? input : input.replace(/[\r\n]/g, "");
export const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input);
}

export const safeQuery = (input: string) => encodeURIComponent(input);
