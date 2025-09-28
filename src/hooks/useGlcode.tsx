import type { GLCodeResponse } from "@/types/glcode";
import { useState, useEffect, useCallback } from "react";
import { useTransaction } from "./account/useTransaction";
// adjust path
// adjust path

export const useGlcodes = (autoLoad = true) => {
  const { glcodesList } = useTransaction();
  const [glcodes, setGlcodes] = useState<GLCodeResponse | null>(null);
  const [loadingGlecode, setLoading] = useState(false);
  const [errorGlcode, setError] = useState<string | null>(null);

  // 👇 stable function with useCallback
  const fetchGlcodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // make sure glcodesList is stable (from a hook or service)
      const response = (await glcodesList()) as GLCodeResponse|null;
      setGlcodes(response);
      if (!response) {
        throw new Error("No GL codes found");
      }
    } catch (err:any) {
      setError(err.message || "An error occurred while fetching GL codes.");
    } finally {
      setLoading(false);
    }
  }, []); // no deps → won't change on every render

  useEffect(() => {
    if (autoLoad) {
      fetchGlcodes();
    }
  }, [autoLoad, fetchGlcodes]); // 👈 stable deps

  const corporateGLCodes =
    glcodes?.categorizedglcodes?.["corporate"]?.map((code) => code.Code) || [];

  const individualCurrentGLCodes =
    glcodes?.categorizedglcodes?.["individual current"]?.map((code) => code.Code) || [];

  const savingsIndividualGLCodes =
    glcodes?.categorizedglcodes?.["savings - individual"]?.map((code) => code.Code) || [];


  return {
    glcodes,
    loadingGlecode,
    errorGlcode,
    fetchGlcodes,
    corporateGLCodes,
    individualCurrentGLCodes,
    savingsIndividualGLCodes,
  };
};
