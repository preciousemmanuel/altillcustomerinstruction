import { BaseService } from "../base.service";
import { encryptionService } from "../encryption.service";
import { safeQuery } from "@/utils/sanitizer";



export class AccountService extends BaseService {
  validate = async (accountNumber: string) => {
    const encryptedAccountNumber = encryptionService.encrypt(accountNumber);

    return this.instance
      .get(
        `api/CustomerInstruction/CustomerInformation?accountNumber=${safeQuery(
          encryptedAccountNumber
        )}`
      )
      .then((res) => res.data);
  };

  validateCode = async (transCode: string) => {
    return this.instance
      .get(`/api/Transactions/GetLoggedTransaction?transactionId=${safeQuery(transCode)}`)
      .then((res) => res.data);
  };

  validateBVN = async (bvnNumber: number) => {
    const encryptedBvnNumber = encryptionService.encrypt(bvnNumber.toString());

    return this.instance
      .get(`api/ThirdPartyContorller/ValidateBvn?bvn=${safeQuery(encryptedBvnNumber)}`)
      .then((res) => res.data);
  };

  deposit = async (data: any) => {
    return this.instance
      .post("api/CustomerInstruction/Deposit", data)
      .then((res) => res.data);
  };

  chequeDeposit = async (data: any) => {
    return this.instance
      .post("api/CustomerInstruction/QueueChequeDeposit", data)
      .then((res) => res.data);
  };

  withdraw = async (data: any) => {
    return this.instance
      .post("api/CustomerInstruction/SavingsWithdrawal", data)
      .then((res) => res.data);
  };

  transfer = async (data: any) => {
    return this.instance
      .post("api/CustomerInstruction/TransferInstruction", data)
      .then((res) => res.data);
  };

  limitCBN = async (data: any) => {
    return this.instance
      .post("api/CustomerInstruction/GetCifLimit", data)
      .then((res) => res.data);
  };

  validateCheque = async (cheque: any, accountNumber: any) => {
    const encryptedAccountNumber = encryptionService.encrypt(accountNumber);
    const encryptedCheque = encryptionService.encrypt(cheque);

    return this.instance
      .get(
        `/api/CustomerInstruction/GetChequeDetails?accountNumber=${safeQuery(
          encryptedAccountNumber
        )}&chequeNumber=${safeQuery(encryptedCheque)}`
      )
      .then((res) => res.data);
  };

  withdrawCheque = async (data: any) => {
    return this.instance
      .post("api/CustomerInstruction/ChequeWithdrawal", data)
      .then((res) => res.data);
  };

  getAllGlCodes = async () => {
    const res = await this.instance.get("/api/GLCode");
    return res.data;
  };
}