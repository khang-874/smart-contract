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

  sendNEAR(receivingAccountId: string, amount: bigint) {
    Assertions.isLeftGreaterThanRight(amount, 0);
    Assertions.isLeftGreaterThanRight(near.accountBalance(), amount, `Not enough balance ${near.accountBalance()} to send ${amount}`);
    const promise = near.promiseBatchCreate(receivingAccountId);
    near.promiseBatchActionTransfer(promise, amount);
    near.promiseReturn(promise);
  }

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
    const newOwn = percentage_own + Number(withdraw) * model_percentage ;

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

  @call({})
  addModel({accountId, modelName} : {accountId:string, modelName:string}){ 
    const account_id = accountId || near.predecessorAccountId();
    validateAccountId(accountId); 

    const account = this.getAccount(accountId);
    assert(account.models.containsKey(modelName), "Model existed");
    account.models.set(modelName, Number(100));
    const newModels = account.models;

    const newAccount = new Account(this.getBalance(account_id), newModels);
    this.setAccount(account_id, newAccount);
  }
  @call({payableFunction:true})
  useModel({receiverId, modelName, amount} : {receiverId:string, modelName:string, amount:bigint}){
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiverId);
    
    this.internalTransfer(senderId, receiverId, modelName, amount, Number(0));
    this.sendNEAR(receiverId, amount); 
    
  }
  @call({payableFunction:true})
  transferStock({receiver_id, model_name, amount, model_percentage} : {receiver_id:string, model_name:string, amount:bigint, model_percentage:number}){
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    
    this.internalTransfer(senderId, receiver_id, model_name, amount, model_percentage);
    this.sendNEAR(receiver_id, amount);  
  }

  @view({})
  getTotalSupply(){
    return this.totalSupply;
  }
  @view({})
  getBalanceOf({accountId} : {accountId:string}){
    validateAccountId(accountId);
    return this.getBalance(accountId);
  }
  @view({})
  getModelsOf({accountId} : {accountId : string}){
    validateAccountId(accountId);
    return this.getAccount(accountId).models;
  }
}

class Assertions {
  static hasAtLeastOneAttachedYocto() {
    assert(near.attachedDeposit() > BigInt(1),"Requires at least 1 yoctoNEAR to ensure signature");
  }

  static isLeftGreaterThanRight(left: string | bigint | number | boolean, right: string | bigint | number | boolean,message: string = null) {
    const msg = message || `Provided amount ${left} should be greater than ${right}`;
    assert(BigInt(left) > BigInt(right), msg);
  }

  static isLeftSmallerThanRight(left: string | bigint | number | boolean, right: string | bigint | number | boolean, message: string = null){
    const msg = message || `Provided amount ${left} should be smaller than ${right}`
    assert(BigInt(left) < BigInt(right), msg);
  }
}