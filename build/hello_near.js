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
 * Returns the current accounts NEAR storage usage.
 */
function storageUsage() {
  return env.storage_usage();
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
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseBatchActionFunctionCallRaw(promiseIndex, methodName, args, amount, gas) {
  env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
}
/**
 * Attach a function call promise action to the NEAR promise index with the provided promise index.
 *
 * @param promiseIndex - The index of the promise to attach a function call action to.
 * @param methodName - The name of the method to be called.
 * @param args - The utf-8 string arguments to call the method with.
 * @param amount - The amount of NEAR to attach to the call.
 * @param gas - The amount of Gas to attach to the call.
 */
function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
  promiseBatchActionFunctionCallRaw(promiseIndex, methodName, encode(args), amount, gas);
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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2;
let FungibleToken = (_dec = NearBindgen({
  requireInit: true
}), _dec2 = initialize(), _dec3 = call({
  payableFunction: true
}), _dec4 = call({
  payableFunction: true
}), _dec5 = call({
  payableFunction: true
}), _dec6 = view(), _dec7 = view(), _dec(_class = (_class2 = class FungibleToken {
  constructor() {
    this.accounts = new LookupMap("a");
    this.accountRegistrants = new LookupMap("r");
    this.accountDeposits = new LookupMap("d");
    this.totalSupply = BigInt("0");
  }
  init({
    owner_id,
    total_supply
  }) {
    Assertions.isLeftGreaterThanRight(total_supply, 0);
    validateAccountId(owner_id);
    this.totalSupply = BigInt(total_supply);
    this.accounts.set(owner_id, this.totalSupply);
  }
  internalGetAccountStorageUsage(accountLength) {
    const initialStorageUsage = storageUsage();
    const tempAccountId = "a".repeat(64);
    this.accounts.set(tempAccountId, BigInt("0"));
    const len64StorageUsage = storageUsage() - initialStorageUsage;
    const len1StorageUsage = len64StorageUsage / BigInt(64);
    const lenAccountStorageUsage = len1StorageUsage * BigInt(accountLength);
    this.accounts.remove(tempAccountId);
    return lenAccountStorageUsage * BigInt(3); // we create an entry in 3 maps
  }
  internalRegisterAccount({
    registrantAccountId,
    accountId,
    amount
  }) {
    assert(!this.accounts.containsKey(accountId), "Account is already registered");
    this.accounts.set(accountId, BigInt("0"));
    this.accountRegistrants.set(accountId, registrantAccountId);
    this.accountDeposits.set(accountId, BigInt(amount));
  }
  internalSendNEAR(receivingAccountId, amount) {
    Assertions.isLeftGreaterThanRight(amount, 0);
    Assertions.isLeftGreaterThanRight(accountBalance(), amount, `Not enough balance ${accountBalance()} to send ${amount}`);
    const promise = promiseBatchCreate(receivingAccountId);
    promiseBatchActionTransfer(promise, amount);
    promiseReturn(promise);
  }
  internalGetBalance(accountId) {
    assert(this.accounts.containsKey(accountId), `Account ${accountId} is not registered`);
    return this.accounts.get(accountId).toString();
  }
  internalDeposit(accountId, amount) {
    const balance = this.internalGetBalance(accountId);
    const newBalance = BigInt(balance) + BigInt(amount);
    this.accounts.set(accountId, newBalance);
    const newSupply = BigInt(this.totalSupply) + BigInt(amount);
    this.totalSupply = newSupply;
  }
  internalWithdraw(accountId, amount) {
    const balance = this.internalGetBalance(accountId);
    const newBalance = BigInt(balance) - BigInt(amount);
    const newSupply = BigInt(this.totalSupply) - BigInt(amount);
    Assertions.isLeftGreaterThanRight(newBalance, -1, "The account doesn't have enough balance");
    Assertions.isLeftGreaterThanRight(newSupply, -1, "Total supply overflow");
    this.accounts.set(accountId, newBalance);
    this.totalSupply = newSupply;
  }
  internalTransfer(senderId, receiverId, amount, _memo = null) {
    assert(senderId != receiverId, "Sender and receiver should be different");
    Assertions.isLeftGreaterThanRight(amount, 0);
    this.internalWithdraw(senderId, amount);
    this.internalDeposit(receiverId, amount);
  }
  storage_deposit({
    account_id
  }) {
    const accountId = account_id || predecessorAccountId();
    validateAccountId(accountId);
    const attachedDeposit$1 = attachedDeposit();
    if (this.accounts.containsKey(accountId)) {
      if (attachedDeposit$1 > 0) {
        this.internalSendNEAR(predecessorAccountId(), attachedDeposit$1);
        return {
          message: "Account is already registered, deposit refunded to predecessor"
        };
      }
      return {
        message: "Account is already registered"
      };
    }
    const storageCost = this.internalGetAccountStorageUsage(accountId.length);
    if (attachedDeposit$1 < storageCost) {
      this.internalSendNEAR(predecessorAccountId(), attachedDeposit$1);
      return {
        message: `Not enough attached deposit to cover storage cost. Required: ${storageCost.toString()}`
      };
    }
    this.internalRegisterAccount({
      registrantAccountId: predecessorAccountId(),
      accountId: accountId,
      amount: storageCost.toString()
    });
    const refund = attachedDeposit$1 - storageCost;
    if (refund > 0) {
      log("Storage registration refunding " + refund + " yoctoNEAR to " + predecessorAccountId());
      this.internalSendNEAR(predecessorAccountId(), refund);
    }
    return {
      message: `Account ${accountId} registered with storage deposit of ${storageCost.toString()}`
    };
  }
  ft_transfer({
    receiver_id,
    amount,
    memo
  }) {
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = predecessorAccountId();
    log("Transfer " + amount + " token from " + senderId + " to " + receiver_id);
    this.internalTransfer(senderId, receiver_id, amount, memo);
  }
  ft_transfer_call({
    receiver_id,
    amount,
    memo,
    msg
  }) {
    Assertions.hasAtLeastOneAttachedYocto();
    const senderId = predecessorAccountId();
    this.internalTransfer(senderId, receiver_id, amount, memo);
    const promise = promiseBatchCreate(receiver_id);
    const params = {
      sender_id: senderId,
      amount: amount,
      msg: msg,
      receiver_id: receiver_id
    };
    log("Transfer call " + amount + " token from " + senderId + " to " + receiver_id + " with message " + msg);
    promiseBatchActionFunctionCall(promise, "ft_on_transfer", JSON.stringify(params), 0, 30000000000000);
    return promiseReturn(promise);
  }
  ft_total_supply() {
    return this.totalSupply;
  }
  ft_balance_of({
    account_id
  }) {
    validateAccountId(account_id);
    return this.internalGetBalance(account_id);
  }
}, (_applyDecoratedDescriptor(_class2.prototype, "init", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "init"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "storage_deposit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "storage_deposit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ft_transfer", [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "ft_transfer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ft_transfer_call", [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "ft_transfer_call"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ft_total_supply", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "ft_total_supply"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "ft_balance_of", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "ft_balance_of"), _class2.prototype)), _class2)) || _class);
function ft_balance_of() {
  const _state = FungibleToken._getState();
  if (!_state && FungibleToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FungibleToken._create();
  if (_state) {
    FungibleToken._reconstruct(_contract, _state);
  }
  const _args = FungibleToken._getArgs();
  const _result = _contract.ft_balance_of(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FungibleToken._serialize(_result, true));
}
function ft_total_supply() {
  const _state = FungibleToken._getState();
  if (!_state && FungibleToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FungibleToken._create();
  if (_state) {
    FungibleToken._reconstruct(_contract, _state);
  }
  const _args = FungibleToken._getArgs();
  const _result = _contract.ft_total_supply(_args);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FungibleToken._serialize(_result, true));
}
function ft_transfer_call() {
  const _state = FungibleToken._getState();
  if (!_state && FungibleToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FungibleToken._create();
  if (_state) {
    FungibleToken._reconstruct(_contract, _state);
  }
  const _args = FungibleToken._getArgs();
  const _result = _contract.ft_transfer_call(_args);
  FungibleToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FungibleToken._serialize(_result, true));
}
function ft_transfer() {
  const _state = FungibleToken._getState();
  if (!_state && FungibleToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FungibleToken._create();
  if (_state) {
    FungibleToken._reconstruct(_contract, _state);
  }
  const _args = FungibleToken._getArgs();
  const _result = _contract.ft_transfer(_args);
  FungibleToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FungibleToken._serialize(_result, true));
}
function storage_deposit() {
  const _state = FungibleToken._getState();
  if (!_state && FungibleToken._requireInit()) {
    throw new Error("Contract must be initialized");
  }
  const _contract = FungibleToken._create();
  if (_state) {
    FungibleToken._reconstruct(_contract, _state);
  }
  const _args = FungibleToken._getArgs();
  const _result = _contract.storage_deposit(_args);
  FungibleToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FungibleToken._serialize(_result, true));
}
function init() {
  const _state = FungibleToken._getState();
  if (_state) {
    throw new Error("Contract already initialized");
  }
  const _contract = FungibleToken._create();
  const _args = FungibleToken._getArgs();
  const _result = _contract.init(_args);
  FungibleToken._saveToStorage(_contract);
  if (_result !== undefined) if (_result && _result.constructor && _result.constructor.name === "NearPromise") _result.onReturn();else env.value_return(FungibleToken._serialize(_result, true));
}
class Assertions {
  static hasAtLeastOneAttachedYocto() {
    assert(attachedDeposit() > BigInt(0), "Requires at least 1 yoctoNEAR to ensure signature");
  }
  static isLeftGreaterThanRight(left, right, message = null) {
    const msg = message || `Provided amount ${left} should be greater than ${right}`;
    assert(BigInt(left) > BigInt(right), msg);
  }
}

export { FungibleToken, ft_balance_of, ft_total_supply, ft_transfer, ft_transfer_call, init, storage_deposit };
//# sourceMappingURL=hello_near.js.map
