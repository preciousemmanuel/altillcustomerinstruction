export interface GLCode {
    Code: string;
    Name: string;
    Category: string;
}

export interface CategorizedGLCodes {
    [category: string]: GLCode[];
}

export interface GLCodeResponse {
    categorizedglcodes: CategorizedGLCodes;
}
export interface CFIRes {
    code: string;
    description: string;
    data: {
        limit: number;
        cif_sub_no: string | null;
        total_withdrawn: number;
        remaining_limit: number;
        charge: number;
        vat: number;
    };
}

