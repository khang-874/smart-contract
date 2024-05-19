// Find all our documentation at https://docs.near.org
import {
  NearBindgen,
  call,
  view,
  initialize,
  near,
  UnorderedMap,
  assert,
  validateAccountId,
} from "near-sdk-js";
class Account{
  balance: bigint;
  models: UnorderedMap<number>;

  constructor(balance:bigint, models: UnorderedMap<number>){
    this.balance = BigInt('0');
    this.models = models;
  }

  get_balance(){
    return this.balance;
  }

  get_model(modelName:string) {
    Assertions.isModelExist(modelName, this.models);
    return this.models.get(modelName);
  }

  set_model(modelName:string, percentage: number){
    return this.models.set(modelName, percentage);
  } 
  get_models(){
    return this.models;
  }
}

@NearBindgen({requireInit: true})
export class NeuroToken{
  accounts: UnorderedMap<Account>; //
  totalSupply: bigint; //Total supply
  models: UnorderedMap<bigint>; //List of model and its owner;

  constructor(){
    this.totalSupply = BigInt("0");
    this.accounts = new UnorderedMap("a");
    this.models = new UnorderedMap("m"); 
  }
  @initialize({})
  init({ totalSupply} : {totalSupply: string}){
    Assertions.isLeftGreaterThanRight(totalSupply, 0);
    // validateAccountId(accountId);

    this.totalSupply = BigInt(totalSupply);
    this.accounts = new UnorderedMap('a');
    let accountId = near.signerAccountId();
    let ownerAccount = this.get_account(accountId);

    //near.log("Create initial state with " + accountId + " and total supply"  + totalSupply);
    this.accounts.set(accountId, ownerAccount);
  }

  get_account(ownerId: string){
    let account : Account = this.accounts.get(ownerId);
    if (account === null) {
      return new Account(BigInt('0'), new UnorderedMap(''));
    }
    return new Account(
      account.balance,
      account.models,
    );
  }

  set_account(accountId : string, account : Account){
    this.accounts.set(accountId, account);
  }

  send_NEAR(receivingAccountId: string, amount: bigint) {
    Assertions.isLeftGreaterThanRight(amount, 0);
    Assertions.isLeftGreaterThanRight(near.accountBalance(), amount, `Not enough balance ${near.accountBalance()} to send ${amount}`);
    const promise = near.promiseBatchCreate(receivingAccountId);
    near.promiseBatchActionTransfer(promise, amount);
    near.promiseReturn(promise);
  }

  get_balance(accountId: string): bigint {
    assert(
      this.accounts.get(accountId) !== null,
      `Account ${accountId} is not registered`
    );
    const account = this.accounts.get(accountId);
    return account.get_balance();
  } 

  get_model_percentage(accountId: string, model_name: string):number{
    assert(this.accounts.get(accountId) !== null, `Account ${accountId} is not registered`);
    assert(this.accounts.get(accountId).models.get(model_name) !== null, `Account ${accountId} does not have the model ${model_name}`);
    
    return this.accounts.get(accountId).models.get(model_name);
  }
  internalTransaction(accountId: string, model_name:string, amount: bigint, model_percentage:number, withdraw:bigint) {
    const balance = this.get_balance(accountId); 
    const percentage_own = this.get_model_percentage(accountId, model_name);

    const newBalance = balance + withdraw * BigInt(amount);
    const newOwn = percentage_own + Number(withdraw) * model_percentage ;

    const newSupply = BigInt(this.totalSupply) - BigInt(amount);
    if(withdraw == BigInt(-1)){
      Assertions.isLeftGreaterThanRight(newBalance,-1,"The account doesn't have enough balance");
      Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
      Assertions.isLeftGreaterThanRight(newOwn, 0.0, "You can not lose more of a company");
    }

    this.get_account(accountId).models.set(model_name, newOwn);
    const newModels = this.get_account(accountId).models;

    const newAccount = new Account(newBalance, newModels);
    this.set_account(accountId, newAccount);
    this.totalSupply = newSupply;
  }

  internalTransfer(senderId: string,receiverId: string,model_name:string, amount: bigint, model_percentage:number ) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    Assertions.isLeftGreaterThanRight(amount, -1);
    this.internalTransaction(senderId, model_name, amount, model_percentage, BigInt(-1));
    this.internalTransaction(receiverId, model_name, amount, model_percentage, BigInt(1));
  }

  @call({})
  add_model({accountId, modelName} : {accountId:string, modelName:string}){ 
    const account_id = accountId || near.predecessorAccountId();
    validateAccountId(accountId); 

    const account = this.get_account(accountId);
    assert(account.models.get(modelName) !== null, "Model existed");
    account.set_model(modelName, Number(100));
    const newModels = account.models;

    const newAccount = new Account(account.get_balance(), newModels);
    this.set_account(account_id, newAccount);
  }
  @call({payableFunction:true})
  use_model({receiverId, modelName, amount} : {receiverId:string, modelName:string, amount:bigint}){
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiverId + " on using the model " + modelName);
    
    this.internalTransfer(senderId, receiverId, modelName, amount, Number(0));
    this.send_NEAR(receiverId, amount); 
    
  }
  @call({payableFunction:true})
  transfer_stock({receiver_id, model_name, amount, model_percentage} : {receiver_id:string, model_name:string, amount:bigint, model_percentage:number}){
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = near.predecessorAccountId();
    near.log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    
    this.internalTransfer(senderId, receiver_id, model_name, amount, model_percentage);
    this.send_NEAR(receiver_id, amount);  
  }
  @view({})
  get_balance_of({accountId} : {accountId:string}) : bigint{
    return this.get_balance(accountId);
  }

  @view({})
  get_models_of({accountId} : {accountId : string}) : string{
    let models = this.get_account(accountId).get_models().toArray();
    near.log("The models of " + accountId + " is: " + models);
    return JSON.stringify(models);
  }
  @view({})
  get_total_supply(){
    return this.totalSupply;
  }
  
}

class Assertions {
  static isModelExist(modelName : string, models : UnorderedMap<number>){
    assert(models.get(modelName) !== null, "This model is not existed!");
  }
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