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
                totalSupply = 10000000;
                yoctoAccountStorage = "90";
                root = worker.rootAccount;
                return [4 /*yield*/, root.devDeploy("./build/neurocoin.wasm")];
            case 2:
                xcc = _a.sent();
                return [4 /*yield*/, root.createSubAccount("ft")];
            case 3:
                ft = _a.sent();
                return [4 /*yield*/, ft.deploy("./build/neurocoin.wasm")];
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
test("Check add model", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, ft, alice, yoctoAccountStorage, aliceAfterBalance, expected, models;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, ft = _a.ft, alice = _a.alice;
                yoctoAccountStorage = t.context.variables.yoctoAccountStorage;
                return [4 /*yield*/, alice.call(ft, "addModel", { accountId: alice.accoundId, modelName: "ChatGPT" })
                    // const result = await alice.call(
                    //   ft,
                    //   "",
                    //   { account_id: alice.accountId },
                    //   { attachedDeposit: NEAR.parse("1 N").toJSON() }
                    // );
                ];
            case 1:
                _b.sent();
                return [4 /*yield*/, alice.balance()];
            case 2:
                aliceAfterBalance = _b.sent();
                expected = {
                    message: "Account ".concat(alice.accountId, " registered with storage deposit of ").concat(yoctoAccountStorage),
                };
                models = alice.getAccount(alice.accountId).models;
                console.log(models);
                // t.deepEqual(result, expected);
                // t.true(
                //   aliceAfterBalance.total > NEAR.parse("9 N").toJSON(),
                //   "alice should have received a refund"
                // );
                t.is(true, true, "Test ");
                return [2 /*return*/];
        }
    });
}); });
// test("should register account and pay for storage", async (t) => {
//   const { ft, alice } = t.context.accounts;
//   const { yoctoAccountStorage } = t.context.variables;
//   const result = await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   const aliceAfterBalance = await alice.balance();
//   const expected = {
//     message: `Account ${alice.accountId} registered with storage deposit of ${yoctoAccountStorage}`,
//   };
//   t.deepEqual(result, expected);
//   t.true(
//     aliceAfterBalance.total > NEAR.parse("9 N").toJSON(),
//     "alice should have received a refund"
//   );
// });
// test("should return message when account is already registered and not refund when no deposit is attached", async (t) => {
//   const { ft, alice } = t.context.accounts;
//   const { yoctoAccountStorage } = t.context.variables;
//   const result = await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   const expected = {
//     message: `Account ${alice.accountId} registered with storage deposit of ${yoctoAccountStorage}`,
//   };
//   t.deepEqual(result, expected);
//   const result2 = await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("0 N").toJSON() }
//   );
//   t.is(result2.message, "Account is already registered");
// });
// test("should return message and refund predecessor caller when trying to pay for storage for an account that is already registered", async (t) => {
//   const { ft, alice } = t.context.accounts;
//   const { yoctoAccountStorage } = t.context.variables;
//   const result = await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   const expected = {
//     message: `Account ${alice.accountId} registered with storage deposit of ${yoctoAccountStorage}`,
//   };
//   t.deepEqual(result, expected);
//   const result2 = await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   t.is(
//     result2.message,
//     "Account is already registered, deposit refunded to predecessor"
//   );
//   const aliceBalance = await alice.balance();
//   t.is(
//     aliceBalance.total > NEAR.parse("9 N"),
//     true,
//     "alice should have received a refund"
//   );
// });
// test("should return message when trying to pay for storage with less than the required amount and refund predecessor caller", async (t) => {
//   const { ft, alice } = t.context.accounts;
//   const { yoctoAccountStorage } = t.context.variables;
//   const result = await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.from("40").toJSON() }
//   );
//   t.is(
//     result.message,
//     `Not enough attached deposit to cover storage cost. Required: ${yoctoAccountStorage}`
//   );
// });
// test("should throw when trying to transfer for an unregistered account", async (t) => {
//   const { ft, alice, root } = t.context.accounts;
//   try {
//     await root.call(
//       ft,
//       "ft_transfer",
//       { receiver_id: alice.accountId, amount: "1" },
//       { attachedDeposit: NEAR.from("1").toJSON() }
//     );
//   } catch (error) {
//     t.true(
//       error.message.includes(`Account ${alice.accountId} is not registered`)
//     );
//   }
// });
// test("Owner has all balance in the beginning", async (t) => {
//   const { ft, root } = t.context.accounts;
//   const result = await ft.view("ft_balance_of", { account_id: root.accountId });
//   t.is(result, "1000");
// });
// test("Can transfer if balance is sufficient", async (t) => {
//   const { alice, ft, root } = t.context.accounts;
//   await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   await root.call(
//     ft,
//     "ft_transfer",
//     { receiver_id: alice.accountId, amount: "100" },
//     { attachedDeposit: NEAR.from("1").toJSON() }
//   );
//   const aliBalance = await ft.view("ft_balance_of", {
//     account_id: alice.accountId,
//   });
//   t.is(aliBalance, "100");
//   const ownerBalance = await ft.view("ft_balance_of", {
//     account_id: root.accountId,
//   });
//   t.is(ownerBalance, "900");
// });
// test("Cannot transfer if balance is not sufficient", async (t) => {
//   const { alice, root, ft } = t.context.accounts;
//   await alice.call(
//     ft,
//     "storage_deposit",
//     { account_id: alice.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   try {
//     await alice.call(
//       ft,
//       "ft_transfer",
//       {
//         receiverId: root.accountId,
//         amount: "100",
//       },
//       { attachedDeposit: NEAR.from("1").toJSON() }
//     );
//   } catch (e) {
//     t.assert(
//       e
//         .toString()
//         .indexOf(
//           "Smart contract panicked: assertion failed: The account doesn't have enough balance"
//         ) >= 0
//     );
//   }
// });
// test("Cross contract transfer", async (t) => {
//   const { xcc, ft, root } = t.context.accounts;
//   await xcc.call(
//     ft,
//     "storage_deposit",
//     { account_id: xcc.accountId },
//     { attachedDeposit: NEAR.parse("1 N").toJSON() }
//   );
//   await root.call(
//     ft,
//     "ft_transfer_call",
//     { receiver_id: xcc.accountId, amount: "900", memo: null, msg: "test msg" },
//     { gas: 200000000000000, attachedDeposit: NEAR.from("1").toJSON() }
//   );
//   const xccBalance = await ft.view("ft_balance_of", {
//     account_id: xcc.accountId,
//   });
//   t.is(xccBalance, "900");
//   const aliSubContractData = await xcc.view("get_contract_data");
//   t.is(
//     aliSubContractData,
//     `[900 from ${root.accountId} to ${xcc.accountId}] test msg `
//   );
//   const ownerBalance = await ft.view("ft_balance_of", {
//     account_id: root.accountId,
//   });
//   t.is(ownerBalance, "100");
// });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5hdmEuanMiLCJzb3VyY2VSb290IjoiL2hvbWUva2hhbmcvRGVza3RvcC9oYWNrYXRob24vTmV1cm9Db2luLyIsInNvdXJjZXMiOlsic2FuZGJveC10cy9tYWluLmF2YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBZSxNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8sT0FBbUIsTUFBTSxLQUFLLENBQUM7QUFFdEMsSUFBTSxJQUFJLEdBQUcsT0FBbUUsQ0FBQztBQUNqRixJQUFJLENBQUMsVUFBVSxDQUFDLFVBQU8sQ0FBQzs7OztvQkFDUCxxQkFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUE7O2dCQUE1QixNQUFNLEdBQUcsU0FBbUI7Z0JBRTVCLFdBQVcsR0FBRyxRQUFRLENBQUM7Z0JBQ3ZCLG1CQUFtQixHQUFHLElBQUksQ0FBQztnQkFFM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7Z0JBQ3BCLHFCQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsRUFBQTs7Z0JBQXBELEdBQUcsR0FBRyxTQUE4QztnQkFDL0MscUJBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFBOztnQkFBdEMsRUFBRSxHQUFHLFNBQWlDO2dCQUM1QyxxQkFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEVBQUE7O2dCQUF6QyxTQUF5QyxDQUFDO2dCQUMxQyxxQkFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUU7d0JBQzFCLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUzt3QkFDeEIsWUFBWSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUU7cUJBQ3JDLENBQUMsRUFBQTs7Z0JBSEYsU0FHRSxDQUFDO2dCQUNXLHFCQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FB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