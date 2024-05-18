// import { Worker, NearAccount } from 'near-workspaces';
// import anyTest, { TestFn } from 'ava';
// import { setDefaultResultOrder } from 'dns'; setDefaultResultOrder('ipv4first'); // temp fix for node >v17
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// // Global context
// const test = anyTest as TestFn<{ worker: Worker, accounts: Record<string, NearAccount> }>;
// test.beforeEach(async (t) => {
//   // Create sandbox, accounts, deploy contracts, etc.
//   const worker = t.context.worker = await Worker.init();
//   // Deploy contract
//   const root = worker.rootAccount;
//   const contract = await root.createSubAccount('test-account');
//   // Get wasm file path from package.json test script in folder above
//   await contract.deploy(
//     process.argv[2],
//   );
//   // Save state for test runs, it is unique for each test
//   t.context.accounts = { root, contract };
// });
// test.afterEach.always(async (t) => {
//   // Stop Sandbox server
//   await t.context.worker.tearDown().catch((error) => {
//     console.log('Failed to stop the Sandbox:', error);
//   });
// });
// test('returns the default greeting', async (t) => {
//   const { contract } = t.context.accounts;
//   const greeting: string = await contract.view('get_greeting', {});
//   t.is(greeting, 'Hello');
// });
// test('changes the greeting', async (t) => {
//   const { root, contract } = t.context.accounts;
//   await root.call(contract, 'set_greeting', { greeting: 'Howdy' });
//   const greeting: string = await contract.view('get_greeting', {});
//   t.is(greeting, 'Howdy');
// });
import { Worker, NEAR } from "near-workspaces";
import anyTest from 'ava';
var test = anyTest;
test.beforeEach(function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var worker, totalSupply, yoctoAccountStorage, root, xcc, ft, alice;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Worker.init()];
            case 1:
                worker = _a.sent();
                totalSupply = 1000;
                yoctoAccountStorage = "90";
                root = worker.rootAccount;
                return [4 /*yield*/, root.devDeploy("./build/fungible-token-helper.wasm")];
            case 2:
                xcc = _a.sent();
                return [4 /*yield*/, root.createSubAccount("ft")];
            case 3:
                ft = _a.sent();
                return [4 /*yield*/, ft.deploy("./build/fungible-token.wasm")];
            case 4:
                _a.sent();
                return [4 /*yield*/, root.call(ft, "init", {
                        owner_id: root.accountId,
                        total_supply: totalSupply.toString(),
                    })];
            case 5:
                _a.sent();
                return [4 /*yield*/, root.createSubAccount("alice", {
                        initialBalance: NEAR.parse("10 N").toJSON(),
                    })];
            case 6:
                alice = _a.sent();
                t.context.worker = worker;
                t.context.accounts = { root: root, ft: ft, alice: alice, xcc: xcc };
                t.context.variables = { totalSupply: totalSupply, yoctoAccountStorage: yoctoAccountStorage };
                return [2 /*return*/];
        }
    });
}); });
test.afterEach.always(function (t) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, t.context.worker.tearDown().catch(function (error) {
                    console.log("Failed to tear down the worker:", error);
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test("should register account and pay for storage", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, alice, yoctoAccountStorage, result, aliceAfterBalance, expected;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, alice = _a.alice;
                yoctoAccountStorage = t.context.variables.yoctoAccountStorage;
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 1:
                result = _b.sent();
                return [4 /*yield*/, alice.balance()];
            case 2:
                aliceAfterBalance = _b.sent();
                expected = {
                    message: "Account ".concat(alice.accountId, " registered with storage deposit of ").concat(yoctoAccountStorage),
                };
                t.deepEqual(result, expected);
                t.true(aliceAfterBalance.total > NEAR.parse("9 N").toJSON(), "alice should have received a refund");
                return [2 /*return*/];
        }
    });
}); });
test("should return message when account is already registered and not refund when no deposit is attached", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, alice, yoctoAccountStorage, result, expected, result2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, alice = _a.alice;
                yoctoAccountStorage = t.context.variables.yoctoAccountStorage;
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 1:
                result = _b.sent();
                expected = {
                    message: "Account ".concat(alice.accountId, " registered with storage deposit of ").concat(yoctoAccountStorage),
                };
                t.deepEqual(result, expected);
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("0 N").toJSON() })];
            case 2:
                result2 = _b.sent();
                t.is(result2.message, "Account is already registered");
                return [2 /*return*/];
        }
    });
}); });
test("should return message and refund predecessor caller when trying to pay for storage for an account that is already registered", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, alice, yoctoAccountStorage, result, expected, result2, aliceBalance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, alice = _a.alice;
                yoctoAccountStorage = t.context.variables.yoctoAccountStorage;
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 1:
                result = _b.sent();
                expected = {
                    message: "Account ".concat(alice.accountId, " registered with storage deposit of ").concat(yoctoAccountStorage),
                };
                t.deepEqual(result, expected);
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 2:
                result2 = _b.sent();
                t.is(result2.message, "Account is already registered, deposit refunded to predecessor");
                return [4 /*yield*/, alice.balance()];
            case 3:
                aliceBalance = _b.sent();
                t.is(aliceBalance.total > NEAR.parse("9 N"), true, "alice should have received a refund");
                return [2 /*return*/];
        }
    });
}); });
test("should return message when trying to pay for storage with less than the required amount and refund predecessor caller", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, alice, yoctoAccountStorage, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, alice = _a.alice;
                yoctoAccountStorage = t.context.variables.yoctoAccountStorage;
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.from("40").toJSON() })];
            case 1:
                result = _b.sent();
                t.is(result.message, "Not enough attached deposit to cover storage cost. Required: ".concat(yoctoAccountStorage));
                return [2 /*return*/];
        }
    });
}); });
test("should throw when trying to transfer for an unregistered account", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, alice, root, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, alice = _a.alice, root = _a.root;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, root.call(ft, "ft_transfer", { receiver_id: alice.accountId, amount: "1" }, { attachedDeposit: NEAR.from("1").toJSON() })];
            case 2:
                _b.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                t.true(error_1.message.includes("Account ".concat(alice.accountId, " is not registered")));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
test("Owner has all balance in the beginning", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, root, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, root = _a.root;
                return [4 /*yield*/, ft.view("ft_balance_of", { account_id: root.accountId })];
            case 1:
                result = _b.sent();
                t.is(result, "1000");
                return [2 /*return*/];
        }
    });
}); });
test("Can transfer if balance is sufficient", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, alice, ft, root, aliBalance, ownerBalance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, alice = _a.alice, ft = _a.ft, root = _a.root;
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 1:
                _b.sent();
                return [4 /*yield*/, root.call(ft, "ft_transfer", { receiver_id: alice.accountId, amount: "100" }, { attachedDeposit: NEAR.from("1").toJSON() })];
            case 2:
                _b.sent();
                return [4 /*yield*/, ft.view("ft_balance_of", {
                        account_id: alice.accountId,
                    })];
            case 3:
                aliBalance = _b.sent();
                t.is(aliBalance, "100");
                return [4 /*yield*/, ft.view("ft_balance_of", {
                        account_id: root.accountId,
                    })];
            case 4:
                ownerBalance = _b.sent();
                t.is(ownerBalance, "900");
                return [2 /*return*/];
        }
    });
}); });
test("Cannot transfer if balance is not sufficient", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, alice, root, ft, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, alice = _a.alice, root = _a.root, ft = _a.ft;
                return [4 /*yield*/, alice.call(ft, "storage_deposit", { account_id: alice.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 1:
                _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, alice.call(ft, "ft_transfer", {
                        receiverId: root.accountId,
                        amount: "100",
                    }, { attachedDeposit: NEAR.from("1").toJSON() })];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _b.sent();
                t.assert(e_1
                    .toString()
                    .indexOf("Smart contract panicked: assertion failed: The account doesn't have enough balance") >= 0);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
test("Cross contract transfer", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, xcc, ft, root, xccBalance, aliSubContractData, ownerBalance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, xcc = _a.xcc, ft = _a.ft, root = _a.root;
                return [4 /*yield*/, xcc.call(ft, "storage_deposit", { account_id: xcc.accountId }, { attachedDeposit: NEAR.parse("1 N").toJSON() })];
            case 1:
                _b.sent();
                return [4 /*yield*/, root.call(ft, "ft_transfer_call", { receiver_id: xcc.accountId, amount: "900", memo: null, msg: "test msg" }, { gas: 200000000000000, attachedDeposit: NEAR.from("1").toJSON() })];
            case 2:
                _b.sent();
                return [4 /*yield*/, ft.view("ft_balance_of", {
                        account_id: xcc.accountId,
                    })];
            case 3:
                xccBalance = _b.sent();
                t.is(xccBalance, "900");
                return [4 /*yield*/, xcc.view("get_contract_data")];
            case 4:
                aliSubContractData = _b.sent();
                t.is(aliSubContractData, "[900 from ".concat(root.accountId, " to ").concat(xcc.accountId, "] test msg "));
                return [4 /*yield*/, ft.view("ft_balance_of", {
                        account_id: root.accountId,
                    })];
            case 5:
                ownerBalance = _b.sent();
                t.is(ownerBalance, "100");
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5hdmEuanMiLCJzb3VyY2VSb290IjoiL2hvbWUva2hhbmcvRGVza3RvcC9oYWNrYXRob24vTmV1cm9Db2luLyIsInNvdXJjZXMiOlsic2FuZGJveC10cy9tYWluLmF2YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5REFBeUQ7QUFDekQseUNBQXlDO0FBQ3pDLDZHQUE2Rzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUU3RyxvQkFBb0I7QUFDcEIsNkZBQTZGO0FBRTdGLGlDQUFpQztBQUNqQyx3REFBd0Q7QUFDeEQsMkRBQTJEO0FBRTNELHVCQUF1QjtBQUN2QixxQ0FBcUM7QUFDckMsa0VBQWtFO0FBRWxFLHdFQUF3RTtBQUN4RSwyQkFBMkI7QUFDM0IsdUJBQXVCO0FBQ3ZCLE9BQU87QUFFUCw0REFBNEQ7QUFDNUQsNkNBQTZDO0FBQzdDLE1BQU07QUFFTix1Q0FBdUM7QUFDdkMsMkJBQTJCO0FBQzNCLHlEQUF5RDtBQUN6RCx5REFBeUQ7QUFDekQsUUFBUTtBQUNSLE1BQU07QUFFTixzREFBc0Q7QUFDdEQsNkNBQTZDO0FBQzdDLHNFQUFzRTtBQUN0RSw2QkFBNkI7QUFDN0IsTUFBTTtBQUVOLDhDQUE4QztBQUM5QyxtREFBbUQ7QUFDbkQsc0VBQXNFO0FBQ3RFLHNFQUFzRTtBQUN0RSw2QkFBNkI7QUFDN0IsTUFBTTtBQUNOLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFlLE1BQU0saUJBQWlCLENBQUM7QUFDNUQsT0FBTyxPQUFtQixNQUFNLEtBQUssQ0FBQztBQUV0QyxJQUFNLElBQUksR0FBRyxPQUFtRSxDQUFDO0FBQ2pGLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBTyxDQUFDOzs7O29CQUNQLHFCQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQTs7Z0JBQTVCLE1BQU0sR0FBRyxTQUFtQjtnQkFFNUIsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDbkIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO2dCQUUz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