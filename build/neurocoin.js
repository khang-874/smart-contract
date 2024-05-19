function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;
  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }
  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);
  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }
  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }
  return desc;
}

// make PromiseIndex a nominal typing
var PromiseIndexBrand;
(function (PromiseIndexBrand) {
  PromiseIndexBrand[PromiseIndexBrand["_"] = -1] = "_";
})(PromiseIndexBrand || (PromiseIndexBrand = {}));
const TYPE_KEY = "typeInfo";
var TypeBrand;
(function (TypeBrand) {
  TypeBrand["BIGINT"] = "bigint";
  TypeBrand["DATE"] = "date";
})(TypeBrand || (TypeBrand = {}));
const ACCOUNT_ID_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;
/**
 * Asserts that the expression passed to the function is truthy, otherwise throws a new Error with the provided message.
 *
 * @param expression - The expression to be asserted.
 * @param message - The error message to be printed.
 */
function assert(expression, message) {
  if (!expression) {
    throw new Error("assertion failed: " + message);
  }
}
function getValueWithOptions(value, options = {
  deserializer: deserialize
}) {
  if (value === null) {
    return options?.defaultValue ?? null;
  }
  const deserialized = deserialize(value);
  if (deserialized === undefined || deserialized === null) {
    return options?.defaultValue ?? null;
  }
  if (options?.reconstructor) {
    return options.reconstructor(deserialized);
  }
  return deserialized;
}
function serializeValueWithOptions(value, {
  serializer
} = {
  serializer: serialize
}) {
  return serializer(value);
}
function serialize(valueToSerialize) {
  return encode(JSON.stringify(valueToSerialize, function (key, value) {
    if (typeof value === "bigint") {
      return {
        value: value.toString(),
        [TYPE_KEY]: TypeBrand.BIGINT
      };
    }
    if (typeof this[key] === "object" && this[key] !== null && this[key] instanceof Date) {
      return {
        value: this[key].toISOString(),
        [TYPE_KEY]: TypeBrand.DATE
      };
    }
    return value;
  }));
}
function deserialize(valueToDeserialize) {
  return JSON.parse(decode(valueToDeserialize), (_, value) => {
    if (value !== null && typeof value === "object" && Object.keys(value).length === 2 && Object.keys(value).every(key => ["value", TYPE_KEY].includes(key))) {
      switch (value[TYPE_KEY]) {
        case TypeBrand.BIGINT:
          return BigInt(value["value"]);
        case TypeBrand.DATE:
          return new Date(value["value"]);
      }
    }
    return value;
  });
}
/**
 * Validates the Account ID according to the NEAR protocol
 * [Account ID rules](https://nomicon.io/DataStructures/Account#account-id-rules).
 *
 * @param accountId - The Account ID string you want to validate.
 */
function validateAccountId(accountId) {
  return accountId.length >= 2 && accountId.length <= 64 && ACCOUNT_ID_REGEX.test(accountId);
}
/**
 * Convert a string to Uint8Array, each character must have a char code between 0-255.
 * @param s - string that with only Latin1 character to convert
 * @returns result Uint8Array
 */
function bytes(s) {
  return env.latin1_string_to_uint8array(s);
}
/**
 * Convert a Uint8Array to string, each uint8 to the single character of that char code
 * @param a - Uint8Array to convert
 * @returns result string
 */
function str(a) {
  return env.uint8array_to_latin1_string(a);
}
/**
 * Encode the string to Uint8Array with UTF-8 encoding
 * @param s - String to encode
 * @returns result Uint8Array
 */
function encode(s) {
  return env.utf8_string_to_uint8array(s);
}
/**
 * Decode the Uint8Array to string in UTF-8 encoding
 * @param a - array to decode
 * @returns result string
 */
function decode(a) {
  return env.uint8array_to_utf8_string(a);
}

var CurveType;
(function (CurveType) {
  CurveType[CurveType["ED25519"] = 0] = "ED25519";
  CurveType[CurveType["SECP256K1"] = 1] = "SECP256K1";
})(CurveType || (CurveType = {}));
var DataLength;
(function (DataLength) {
  DataLength[DataLength["ED25519"] = 32] = "ED25519";
  DataLength[DataLength["SECP256K1"] = 64] = "SECP256K1";
})(DataLength || (DataLength = {}));

/**
 * A Promise result in near can be one of:
 * - NotReady = 0 - the promise you are specifying is still not ready, not yet failed nor successful.
 * - Successful = 1 - the promise has been successfully executed and you can retrieve the resulting value.
 * - Failed = 2 - the promise execution has failed.
 */
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
/**
 * A promise error can either be due to the promise failing or not yet being ready.
 */
var PromiseError;
(function (PromiseError) {
  PromiseError[PromiseError["Failed"] = 0] = "Failed";
  PromiseError[PromiseError["NotReady"] = 1] = "NotReady";
})(PromiseError || (PromiseError = {}));

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
/**
 * Logs parameters in the NEAR WASM virtual machine.
 *
 * @param params - Parameters to log.
 */
function log(...params) {
  env.log(params.reduce((accumulated, parameter, index) => {
    // Stringify undefined
    const param = parameter === undefined ? "undefined" : parameter;
    // Convert Objects to strings and convert to string
    const stringified = typeof param === "object" ? JSON.stringify(param) : `${param}`;
    if (index === 0) {
      return stringified;
    }
    return `${accumulated} ${stringified}`;
  }, ""));
}
/**
 * Returns the account ID of the account that signed the transaction.
 * Can only be called in a call or initialize function.
 */
function signerAccountId() {
  env.signer_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the account that called the function.
 * Can only be called in a call or initialize function.
 */
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the account ID of the current contract - the contract that is being executed.
 */
function currentAccountId() {
  env.current_account_id(0);
  return str(env.read_register(0));
}
/**
 * Returns the amount of NEAR attached to this function call.
 * Can only be called in payable functions.
 */
function attachedDeposit() {
  return env.attached_deposit();
}
/**
 * Returns the current account's account balance.
 */
function accountBalance() {
  return env.account_balance();
}
/**
 * Reads the value from NEAR storage that is stored under the provided key.
 *
 * @param key - The key to read from storage.
 */
function storageReadRaw(key) {
  const returnValue = env.storage_read(key, 0);
  if (returnValue !== 1n) {
    return null;
  }
  return env.read_register(0);
}
/**
 * Checks for the existance of a value under the provided key in NEAR storage.
 *
 * @param key - The key to check for in storage.
 */
function storageHasKeyRaw(key) {
  return env.storage_has_key(key) === 1n;
}
/**
 * Checks for the existance of a value under the provided utf-8 string key in NEAR storage.
 *
 * @param key - The utf-8 string key to check for in storage.
 */
function storageHasKey(key) {
  return storageHasKeyRaw(encode(key));
}
/**
 * Get the last written or removed value from NEAR storage.
 */
function storageGetEvictedRaw() {
  return env.read_register(EVICTED_REGISTER);
}
/**
 * Writes the provided bytes to NEAR storage under the provided key.
 *
 * @param key - The key under which to store the value.
 * @param value - The value to store.
 */
function storageWriteRaw(key, value) {
  return env.storage_write(key, value, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided key from NEAR storage.
 *
 * @param key - The key to be removed.
 */
function storageRemoveRaw(key) {
  return env.storage_remove(key, EVICTED_REGISTER) === 1n;
}
/**
 * Removes the value of the provided utf-8 string key from NEAR storage.
 *
 * @param key - The utf-8 string key to be removed.
 */
function storageRemove(key) {
  return storageRemoveRaw(encode(key));
}
/**
 * Returns the arguments passed to the current smart contract call.
 */
function inputRaw() {
  env.input(0);
  return env.read_register(0);
}
/**
 * Returns the arguments passed to the current smart contract call as utf-8 string.
 */
function input() {
  return decode(inputRaw());
}
/**
 * Create a NEAR promise which will have multiple promise actions inside.
 *
 * @param accountId - The account ID of the target contract.
 */
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
/**
 * Attach a transfer promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a transfer action to.
 * @param amount - The amount of NEAR to transfer.
 */
function promiseBatchActionTransfer(promiseIndex, amount) {
  env.promise_batch_action_transfer(promiseIndex, amount);
}
/**
 * Executes the promise in the NEAR WASM virtual machine.
 *
 * @param promiseIndex - The index of the promise to execute.
 */
function promiseReturn(promiseIndex) {
  env.promise_return(promiseIndex);
}

/**
 * A lookup map that stores data in NEAR storage.
 */
class LookupMap {
  /**
   * @param keyPrefix - The byte prefix to use when storing elements inside this collection.
   */
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }
  /**
   * Checks whether the collection contains the value.
   *
   * @param key - The value for which to check the presence.
   */
  containsKey(key) {
    const storageKey = this.keyPrefix + key;
    return storageHasKey(storageKey);
  }
  /**
   * Get the data stored at the provided key.
   *
   * @param key - The key at which to look for the data.
   * @param options - Options for retrieving the data.
   */
  get(key, options) {
    const storageKey = this.keyPrefix + key;
    const value = storageReadRaw(encode(storageKey));
    return getValueWithOptions(value, options);
  }
  /**
   * Removes and retrieves the element with the provided key.
   *
   * @param key - The key at which to remove data.
   * @param options - Options for retrieving the data.
   */
  remove(key, options) {
    const storageKey = this.keyPrefix + key;
    if (!storageRemove(storageKey)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Store a new value at the provided key.
   *
   * @param key - The key at which to store in the collection.
   * @param newValue - The value to store in the collection.
   * @param options - Options for retrieving and storing the data.
   */
  set(key, newValue, options) {
    const storageKey = this.keyPrefix + key;
    const storageValue = serializeValueWithOptions(newValue, options);
    if (!storageWriteRaw(encode(storageKey), storageValue)) {
      return options?.defaultValue ?? null;
    }
    const value = storageGetEvictedRaw();
    return getValueWithOptions(value, options);
  }
  /**
   * Extends the current collection with the passed in array of key-value pairs.
   *
   * @param keyValuePairs - The key-value pairs to extend the collection with.
   * @param options - Options for storing the data.
   */
  extend(keyValuePairs, options) {
    for (const [key, value] of keyValuePairs) {
      this.set(key, value, options);
    }
  }
  /**
   * Serialize the collection.
   *
   * @param options - Options for storing the data.
   */
  serialize(options) {
    return serializeValueWithOptions(this, options);
  }
  /**
   * Converts the deserialized data from storage to a JavaScript instance of the collection.
   *
   * @param data - The deserialized data to create an instance from.
   */
  static reconstruct(data) {
    return new LookupMap(data.keyPrefix);
  }
}

/**
 * Tells the SDK to use this function as the initialization function of the contract.
 *
 * @param _empty - An empty object.
 */
function initialize(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
/**
 * Tells the SDK to expose this function as a view function.
 *
 * @param _empty - An empty object.
 */
function view(_empty) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, _descriptor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {};
}
function call({
  privateFunction = false,
  payableFunction = false
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (_target, _key, descriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    descriptor.value = function (...args) {
      if (privateFunction && predecessorAccountId() !== currentAccountId()) {
        throw new Error("Function is private");
      }
      if (!payableFunction && attachedDeposit() > 0n) {
        throw new Error("Function is not payable");
      }
      return originalMethod.apply(this, args);
    };
  };
}
function NearBindgen({
  requireInit = false,
  serializer = serialize,
  deserializer = deserialize
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return target => {
    return class extends target {
      static _create() {
        return new target();
      }
      static _getState() {
        const rawState = storageReadRaw(bytes("STATE"));
        return rawState ? this._deserialize(rawState) : null;
      }
      static _saveToStorage(objectToSave) {
        storageWriteRaw(bytes("STATE"), this._serialize(objectToSave));
      }
      static _getArgs() {
        return JSON.parse(input() || "{}");
      }
      static _serialize(value, forReturn = false) {
        if (forReturn) {
          return encode(JSON.stringify(value, (_, value) => typeof value === "bigint" ? `${value}` : value));
        }
        return serializer(value);
      }
      static _deserialize(value) {
        return deserializer(value);
      }
      static _reconstruct(classObject, plainObject) {
        for (const item in classObject) {
          const reconstructor = classObject[item].constructor?.reconstruct;
          classObject[item] = reconstructor ? reconstructor(plainObject[item]) : plainObject[item];
        }
        return classObject;
      }
      static _requireInit() {
        return requireInit;
      }
    };
  };
}

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2;
class Account {
  constructor(balance, models) {
    this.balance = BigInt('0');
    this.models = models;
  }
  publishModel(name) {
    this.models.set(name, 100.0);
  }
  deleteModel(name) {
    this.models.remove(name);
  }
  buyModel(name, amount) {
    this.models.set(name, amount);
  }
  sellModel(name, amount) {
    let current = this.models.get(name);
    Assertions.isLeftGreaterThanRight(current, amount);
    this.models.set(name, current - amount);
  }
}
let NeuroToken = (_dec = NearBindgen({
  requireInit: true
}), _dec2 = initialize(), _dec3 = call({}), _dec4 = call({
  payableFunction: true
}), _dec5 = call({
  payableFunction: true
}), _dec6 = view(), _dec7 = view(), _dec8 = view(), _dec(_class = (_class2 = class NeuroToken {
  //
  //Total supply
  //List of model and its owner;

  constructor() {
    this.totalSupply = BigInt("0");
    this.accounts = new LookupMap("a");
    this.models = new LookupMap("m");
  }
  init({
    total_supply
  }) {
    Assertions.isLeftGreaterThanRight(total_supply, 0);
    this.totalSupply = BigInt(total_supply);
    this.accounts = new LookupMap('a');
    let ownerId = signerAccountId();
    let ownerAccount = this.getAccount(ownerId);
    this.accounts.set(ownerId, ownerAccount);
  }
  getAccount(ownerId) {
    let account = this.accounts.get(ownerId);
    if (account === null) {
      return new Account(BigInt('0'), new LookupMap(''));
    }
    return new Account(account.balance, account.models);
  }
  setAccount(accountId, account) {
    this.accounts.set(accountId, account);
  }
  sendNEAR(receivingAccountId, amount) {
    Assertions.isLeftGreaterThanRight(amount, 0);
    Assertions.isLeftGreaterThanRight(accountBalance(), amount, `Not enough balance ${accountBalance()} to send ${amount}`);
    const promise = promiseBatchCreate(receivingAccountId);
    promiseBatchActionTransfer(promise, amount);
    promiseReturn(promise);
  }
  getBalance(accountId) {
    assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
    return this.accounts.get(accountId).balance;
  }
  getModelPercentage(accountId, model_name) {
    assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
    assert(this.accounts.get(accountId).models.containsKey(model_name), `Account ${accountId} does not have the model ${model_name}`);
    return this.accounts.get(accountId).models.get(model_name);
  }
  internalTransaction(accountId, model_name, amount, model_percentage, withdraw) {
    const balance = this.getBalance(accountId);
    const percentage_own = this.getModelPercentage(accountId, model_name);
    const newBalance = balance + withdraw * BigInt(amount);
    const newOwn = percentage_own + Number(withdraw) * model_percentage;
    const newSupply = BigInt(this.totalSupply) - BigInt(amount);
    if (withdraw == BigInt(-1)) {
      Assertions.isLeftGreaterThanRight(newBalance, -1, "The account doesn't have enough balance");
      Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
      Assertions.isLeftGreaterThanRight(newOwn, 0.0, "You can not lose more of a company");
    }
    this.getAccount(accountId).models.set(model_name, newOwn);
    const newModels = this.getAccount(accountId).models;
    const newAccount = new Account(newBalance, newModels);
    this.setAccount(accountId, newAccount);
    this.totalSupply = newSupply;
  }
  internalTransfer(senderId, receiverId, model_name, amount, model_percentage) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    Assertions.isLeftGreaterThanRight(amount, 0);
    this.internalTransaction(senderId, model_name, amount, model_percentage, BigInt(-1));
    this.internalTransaction(receiverId, model_name, amount, model_percentage, BigInt(1));
  }
  addModel({
    accountId,
    modelName
  }) {
    const account_id = accountId || predecessorAccountId();
    validateAccountId(accountId);
    const account = this.getAccount(accountId);
    assert(account.models.containsKey(modelName), "Model existed");
    account.models.set(modelName, Number(100));
    const newModels = account.models;
    const newAccount = new Account(this.getBalance(account_id), newModels);
    this.setAccount(account_id, newAccount);
  }
  useModel({
    receiverId,
    modelName,
    amount
  }) {
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = predecessorAccountId();
    log("Transfer " + amount + " token from " + senderId + " to " + receiverId);
    this.internalTransfer(senderId, receiverId, modelName, amount, Number(0));
    this.sendNEAR(receiverId, amount);
  }
  transferStock({
    receiver_id,
    model_name,
    amount,
    model_percentage
  }) {
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = predecessorAccountId();
    log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    this.internalTransfer(senderId, receiver_id, model_name, amount, model_percentage);
    this.sendNEAR(receiver_id, amount);
  }
  getTotalSupply() {
    return this.totalSupply;
  }
  getBalanceOf({
    accountId
  }) {
    validateAccountId(accountId);
    return this.getBalance(accountId);
  }
  getModelsOf({
    accountId
  }) {
    validateAccountId(accountId);
    return this.getAccount(accountId).models;
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "init", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "init"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "addModel", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "addModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "useModel", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "useModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "transferStock", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "transferStock"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTotalSupply", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "getTotalSupply"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getBalanceOf", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "getBalanceOf"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getModelsOf", [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "getModelsOf"), _class2.prototype)), _class2)) || _class);
function getModelsOf() {
  const _state = NeuroToken._getState();
  if (!_state && NeuroToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = NeuroToken._create();
  if (_state) {
    NeuroToken._reconstruct(_contract, _state);
  }
  const _args = NeuroToken._getArgs();
  const _result = _contract.getModelsOf(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
function getBalanceOf() {
  const _state = NeuroToken._getState();
  if (!_state && NeuroToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = NeuroToken._create();
  if (_state) {
    NeuroToken._reconstruct(_contract, _state);
  }
  const _args = NeuroToken._getArgs();
  const _result = _contract.getBalanceOf(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
function getTotalSupply() {
  const _state = NeuroToken._getState();
  if (!_state && NeuroToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = NeuroToken._create();
  if (_state) {
    NeuroToken._reconstruct(_contract, _state);
  }
  const _args = NeuroToken._getArgs();
  const _result = _contract.getTotalSupply(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
function transferStock() {
  const _state = NeuroToken._getState();
  if (!_state && NeuroToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = NeuroToken._create();
  if (_state) {
    NeuroToken._reconstruct(_contract, _state);
  }
  const _args = NeuroToken._getArgs();
  const _result = _contract.transferStock(_args);
  NeuroToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
function useModel() {
  const _state = NeuroToken._getState();
  if (!_state && NeuroToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = NeuroToken._create();
  if (_state) {
    NeuroToken._reconstruct(_contract, _state);
  }
  const _args = NeuroToken._getArgs();
  const _result = _contract.useModel(_args);
  NeuroToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
function addModel() {
  const _state = NeuroToken._getState();
  if (!_state && NeuroToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = NeuroToken._create();
  if (_state) {
    NeuroToken._reconstruct(_contract, _state);
  }
  const _args = NeuroToken._getArgs();
  const _result = _contract.addModel(_args);
  NeuroToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
function init() {
  const _state = NeuroToken._getState();
  if (_state) {
    throw new Error("Contract already initialized");
  }
  const _contract = NeuroToken._create();
  const _args = NeuroToken._getArgs();
  const _result = _contract.init(_args);
  NeuroToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(NeuroToken._serialize(_result, true));
}
class Assertions {
  static hasAtLeastOneAttachedYocto() {
    assert(attachedDeposit() > BigInt(1), "Requires at least 1 yoctoNEAR to ensure signature");
  }
  static isLeftGreaterThanRight(left, right, message = null) {
    const msg = message || `Provided amount ${left} should be greater than ${right}`;
    assert(BigInt(left) > BigInt(right), msg);
  }
  static isLeftSmallerThanRight(left, right, message = null) {
    const msg = message || `Provided amount ${left} should be smaller than ${right}`;
    assert(BigInt(left) < BigInt(right), msg);
  }
}

export { NeuroToken, addModel, getBalanceOf, getModelsOf, getTotalSupply, init, transferStock, useModel };
//# sourceMappingURL=neurocoin.js.map
