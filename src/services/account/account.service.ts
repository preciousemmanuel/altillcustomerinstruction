import axios, { type AxiosInstance } from "axios";
import { generateKey,decodeKey,generateforString } from "../../utils/jwtToken";
import { safeQuery } from "@/utils/sanitizer";



export class AccountService {
    protected readonly instance: AxiosInstance
    public constructor(url: any) {
      this.instance = axios.create({
        baseURL: url,
        timeout: 50000,
        timeoutErrorMessage: 'Time out!'
      })
      this.setupInterceptors();
    }
  
    private setupInterceptors() {
      this.instance.interceptors.response.use(
        (response) => {
          if (response?.status === 401) {
            window.location.href = "/login";
          }
          return response;
        },
        (error) => {
          if (error.response?.status === 401) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      );
    }
  
    validate = async (accountNumber: string) => {
      const encryptedAccountNumber: any = await generateforString(accountNumber);
  
      return this.instance
        .get(`api/CustomerInstruction/CustomerInformation?accountNumber=${safeQuery(encryptedAccountNumber)}`, {
          
        })
        .then(async res => {
          // const retrievedData = await decodeKey(res.data.data)
          return decodeKey(res.data.data)
        })
    }
  
    validateCode = async (transCode: string) => {
      // const encryptedAccountNumber: any = await generateforString(transCode);
  
      return this.instance
        .get(`/api/Transactions/GetLoggedTransaction?transactionId=${safeQuery(transCode)}`, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
    validateBVN = async (bvnNumber: number) => {
      const encryptedBvnNumber: any = await generateforString(bvnNumber);
  
      return this.instance
        .get(`api/ThirdPartyContorller/ValidateBvn?bvn=${safeQuery(encryptedBvnNumber)}`, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
    deposit = async (data: any) => {
      const tokenatedData: any = await generateKey(data)
      return this.instance
        .post('api/CustomerInstruction/Deposit', { data: tokenatedData }, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
    withdraw = async (data: any) => {
      const tokenatedData: any = await generateKey(data)
      return this.instance
        .post('api/Transactions/ProcessSavingsWithdrawal', { data: tokenatedData }, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
    transfer = async (data: any) => {
      const tokenatedData: any = await generateKey(data)
      return this.instance
        .post('api/Transfer/ProcessTransfers', { data: tokenatedData }, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
    limitCBN = async (data: any) => {
      const tokenatedData: any = await generateKey(data)
      return this.instance
        .post('api/ThirdPartyContorller/GetCifLimit', { data: tokenatedData }, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
  
    validateCheque = async (cheque: any, accountNumber: any) => {
      const encryptedAccountNumber: any = await generateforString(accountNumber);
      const encryptedCheque: any = await generateforString(cheque);
  
      return this.instance
        .get(`/api/CustomerInstruction/GetChequeDetails?accountNumber=${safeQuery(encryptedAccountNumber)}&chequeNumber=${safeQuery(encryptedCheque)}`, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }
  
    withdrawCheque = async (data: any) => {
      const tokenatedData: any = await generateKey(data)
      return this.instance
        .post('api/Transactions/ProcessChequeWithdrawal', { data: tokenatedData }, {
          
        })
        .then(res => {
          return decodeKey(res.data.data)
        })
    }


    getAllGlCodes = async () => {
      const res: any = await this.instance.get("/api/GLCode", {
        
      });
      return decodeKey(res?.data?.data);
    };
  
   
  }