// Find all our documentation at https://docs.near.org
import {
  NearBindgen,
  call,
  view,
  initialize,
  near,
  LookupMap,
  assert,
  validateAccountId,
} from "near-sdk-js";
class Account{
  balance: bigint;
  models: LookupMap<number>;

  constructor(balance:bigint, models: LookupMap<number>){
    this.balance = BigInt('0');
    this.models = models;
  }

  publishModel(name: string){
    this.models.set(name, 100.0);
  }

  deleteModel(name: string){
    this.models.remove(name);
  }

  buyModel(name: string, amount: number){
    this.models.set(name, amount);
  }

  sellModel(name: string, amount: number){
    let current = this.models.get(name);
    Assertions.isLeftGreaterThanRight(current, amount);
    this.models.set(name, current - amount);
  }
}

@NearBindgen({requireInit: true})
export class NeuroToken{
  accounts: LookupMap<Account>; //
  totalSupply: bigint; //Total supply
  models: LookupMap<bigint>; //List of model and its owner;

  constructor(){
    this.totalSupply = BigInt("0");
    this.accounts = new LookupMap("a");
    this.models = new LookupMap("m"); 
  }
  @initialize({})
  init({total_supply} : {total_supply: string}){
    Assertions.isLeftGreaterThanRight(total_supply, 0);
    this.totalSupply = BigInt(total_supply);
    this.accounts = new LookupMap('a');
    let ownerId : string= near.signerAccountId();
    let ownerAccount = this.getAccount(ownerId);

    this.accounts.set(ownerId, ownerAccount);
  }

  getAccount(ownerId: string){
    let account : Account = this.accounts.get(ownerId);
    if (account === null) {
      return new Account(BigInt('0'), new LookupMap(''));
    }
    return new Account(
      account.balance,
      account.models,
    );
  }

  setAccount(accountId : string, account : Account){
    this.accounts.set(accountId, account);
  }

  // internalSendNEAR(receivingAccountId: string, amount: bigint) {
  //   Assertions.isLeftGreaterThanRight(amount, 0);
  //   Assertions.isLeftGreaterThanRight(
  //     near.accountBalance(),
  //     amount,
  //     `Not enough balance ${near.accountBalance()} to send ${amount}`
  //   );
  //   const promise = near.promiseBatchCreate(receivingAccountId);
  //   near.promiseBatchActionTransfer(promise, amount);
  //   near.promiseReturn(promise);
  // }

  getBalance(accountId: string): bigint {
    assert(
      this.accounts.containsKey(accountId),
      `Account ${accountId} is not registered`
    );
    return this.accounts.get(accountId).balance;
  } 

  getModelPercentage(accountId: string, model_name: string):number{
    assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
    assert(this.accounts.get(accountId).models.containsKey(model_name), `Account ${accountId} does not have the model ${model_name}`);
    
    return this.accounts.get(accountId).models.get(model_name);
  }
  internalTransaction(accountId: string, model_name:string, amount: bigint, model_percentage:number, withdraw:bigint) {
    const balance = this.getBalance(accountId); 
    const percentage_own = this.getModelPercentage(accountId, model_name);

    const newBalance = balance + withdraw * BigInt(amount);
    const newOwn = percentage_own +  Number(withdraw) * model_percentage ;

    const newSupply = BigInt(this.totalSupply) - BigInt(amount);
    if(withdraw == BigInt(-1)){
      Assertions.isLeftGreaterThanRight(newBalance,-1,"The account doesn't have enough balance");
      Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
      Assertions.isLeftGreaterThanRight(newOwn, 0.0, "You can not lose more of a company");
    }

    this.getAccount(accountId).models.set(model_name, newOwn);
    const newModels = this.getAccount(accountId).models;

    const newAccount = new Account(newBalance, newModels);
    this.setAccount(accountId, newAccount);
    this.totalSupply = newSupply;
  }

  internalTransfer(senderId: string,receiverId: string,model_name:string, amount: bigint, model_percentage:number ) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    Assertions.isLeftGreaterThanRight(amount, 0);
    this.internalTransaction(senderId, model_name, amount, model_percentage, BigInt(-1));
    this.internalTransaction(receiverId, model_name, amount, model_percentage, BigInt(1));
  }

  @call({payableFunction:true})
  publishModel({account_id, name, amount} : {account_id:string, name:string, amount:number}){
    // const accountId = account_id || near.predecessorAccountId();
    // validateAccountId(accountId);
    // const attachedDeposit = near.attachedDeposit();

    // if (this.accounts.containsKey(accountId)) {
    //   if (attachedDeposit > 0) {
    //     this.internalSendNEAR(near.predecessorAccountId(), attachedDeposit);
    //     return {
    //       message:
    //         "Account is already registered, deposit refunded to predecessor",
    //     };
    //   }
    //   return { message: "Account is already registered" };
    // }
  }
  
  @call({payableFunction:true})
  transferStock({receiver_id, model_name, amount, model_percentage} : {receiver_id:string, model_name:string, amount:bigint, model_percentage:number}){
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    
    this.internalTransfer(senderId, receiver_id, model_name, amount, model_percentage);
    
    const promise = near.promiseBatchCreate(receiver_id);

    near.promiseBatchActionTransfer(promise, BigInt(amount));
    near.promiseReturn(promise);
  }

  @view({})
  get_total_supply(){
    return this.totalSupply;
  }
}

//////////////////////
// @NearBindgen({ requireInit: true })
// export class FungibleToken {
//   accounts: LookupMap<bigint>;
//   accountRegistrants: LookupMap<string>;
//   accountDeposits: LookupMap<bigint>;
//   totalSupply: bigint;

//   constructor() {
//     this.accounts = new LookupMap("a");
//     this.accountRegistrants = new LookupMap("r");
//     this.accountDeposits = new LookupMap("d");
//     this.totalSupply = BigInt("0");
//   }

//   @initialize({})
//   init({ owner_id, total_supply }: { owner_id: string; total_supply: string }) {
//     Assertions.isLeftGreaterThanRight(total_supply, 0);
//     validateAccountId(owner_id);
//     this.totalSupply = BigInt(total_supply);
//     this.accounts.set(owner_id, this.totalSupply);
//   }

//   internalGetAccountStorageUsage(accountLength: number): bigint {
//     const initialStorageUsage = near.storageUsage();
//     const tempAccountId = "a".repeat(64);
//     this.accounts.set(tempAccountId, BigInt("0"));
//     const len64StorageUsage = near.storageUsage() - initialStorageUsage;
//     const len1StorageUsage = len64StorageUsage / BigInt(64);
//     const lenAccountStorageUsage = len1StorageUsage * BigInt(accountLength);
//     this.accounts.remove(tempAccountId);
//     return lenAccountStorageUsage * BigInt(3); // we create an entry in 3 maps
//   }

//   internalRegisterAccount({
//     registrantAccountId,
//     accountId,
//     amount,
//   }: {
//     registrantAccountId: string;
//     accountId: string;
//     amount: string;
//   }) {
//     assert(
//       !this.accounts.containsKey(accountId),
//       "Account is already registered"
//     );
//     this.accounts.set(accountId, BigInt("0"));
//     this.accountRegistrants.set(accountId, registrantAccountId);
//     this.accountDeposits.set(accountId, BigInt(amount));
//   }

//   internalSendNEAR(receivingAccountId: string, amount: bigint) {
//     Assertions.isLeftGreaterThanRight(amount, 0);
//     Assertions.isLeftGreaterThanRight(
//       near.accountBalance(),
//       amount,
//       `Not enough balance ${near.accountBalance()} to send ${amount}`
//     );
//     const promise = near.promiseBatchCreate(receivingAccountId);
//     near.promiseBatchActionTransfer(promise, amount);
//     near.promiseReturn(promise);
//   }

//   internalGetBalance(accountId: string): string {
//     assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
//     return this.accounts.get(accountId).toString();
//   }

//   internalDeposit(accountId: string, amount: string) {
//     const balance = this.internalGetBalance(accountId);
//     const newBalance = BigInt(balance) + BigInt(amount);
//     this.accounts.set(accountId, newBalance);
//     const newSupply = BigInt(this.totalSupply) + BigInt(amount);
//     this.totalSupply = newSupply;
//   }

//   internalWithdraw(accountId: string, amount: string) {
//     const balance = this.internalGetBalance(accountId);
//     const newBalance = BigInt(balance) - BigInt(amount);
//     const newSupply = BigInt(this.totalSupply) - BigInt(amount);
//     Assertions.isLeftGreaterThanRight(
//       newBalance,
//       -1,
//       "The account doesn't have enough balance"
//     );
//     Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
//     this.accounts.set(accountId, newBalance);
//     this.totalSupply = newSupply;
//   }

//   internalTransfer(
//     senderId: string,
//     receiverId: string,
//     amount: string,
//     _memo: string = null
//   ) {
//     assert(senderId != receiverId, "Sender and receiver should be different");
//     Assertions.isLeftGreaterThanRight(amount, 0);
//     this.internalWithdraw(senderId, amount);
//     this.internalDeposit(receiverId, amount);
//   }

//   @call({ payableFunction: true })
//   ft_transfer({receiver_id, model, amount}: {receiver_id: string, model:string, amount: string}) {
//     Assertions.hasAtLeastOneAttachedYocto();
//     const senderId = near.predecessorAccountId();
//     near.log(
//       "Transfer " + amount + " token from " + senderId + " to " + receiver_id
//     );
    
//     this.internalTransfer(senderId, receiver_id, amount);
    
//     const promise = near.promiseBatchCreate(receiver_id);

//     near.promiseBatchActionTransfer(promise, BigInt(amount));
//     near.promiseReturn(promise);
//   }
 
//   @view({})
//   ft_total_supply() {
//     return this.totalSupply;
//   }

//   @view({})
//   ft_balance_of({ account_id }: { account_id: string }) {
//     validateAccountId(account_id);
//     return this.internalGetBalance(account_id);
//   }
// }

class Assertions {
  static hasAtLeastOneAttachedYocto() {
    assert(
      near.attachedDeposit() > BigInt(1),
      "Requires at least 1 yoctoNEAR to ensure signature"
    );
  }

  static isLeftGreaterThanRight(
    left: string | bigint | number | boolean,
    right: string | bigint | number | boolean,
    message: string = null
  ) {
    const msg =
      message || `Provided amount ${left} should be greater than ${right}`;
    assert(BigInt(left) > BigInt(right), msg);
  }

  static isLeftSmallerThanRight(
    left: string | bigint | number | boolean,
    right: string | bigint | number | boolean,
    message: string = null
  ){
    const msg = message || `Provided amount ${left} should be smaller than ${right}`
    assert(BigInt(left) < BigInt(right), msg);
  }
}