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
    var worker, totalSupply, root, neurocoinFt, khang, hien;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Worker.init()];
            case 1:
                worker = _a.sent();
                totalSupply = 1e6;
                root = worker.rootAccount;
                return [4 /*yield*/, root.devDeploy("./build/neurocoin.wasm")];
            case 2:
                neurocoinFt = _a.sent();
                return [4 /*yield*/, root.createSubAccount('khang')];
            case 3:
                khang = _a.sent();
                return [4 /*yield*/, root.createSubAccount('hien')];
            case 4:
                hien = _a.sent();
                //Init the contract
                return [4 /*yield*/, khang.call(neurocoinFt, "init", {
                        accountId: khang.accountId,
                        totalSupply: totalSupply.toString()
                    })
                    //Save state for test runs
                ];
            case 5:
                //Init the contract
                _a.sent();
                //Save state for test runs
                t.context.worker = worker;
                t.context.accounts = { root: root, neurocoinFt: neurocoinFt, khang: khang, hien: hien };
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
test("Owner initial details", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, neurocoinFt, khang, totalSupply;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, neurocoinFt = _a.neurocoinFt, khang = _a.khang;
                return [4 /*yield*/, neurocoinFt.view("get_total_supply", {})];
            case 1:
                totalSupply = _b.sent();
                t.is(totalSupply, '1000000', "The total supply should be 1,000,000");
                return [2 /*return*/];
        }
    });
}); });
// test("Add model to the blockchain", async (t) =>{
//   const {neurocoinFt, khang, hien} = t.context.accounts;
//   // khang.call(neurocoinFt, "addModel", {
//   //   modelName: "ChatGPT",
//   // })
//   // khang.call(neurocoinFt, "addModel", {
//   //   modelName: "googleGPT",
//   // })
//   // let model;
//   // try{
//   //   const model = await neurocoinFt.view("getModelsOf", {accountId: khang.accountId});
//   //   console.log(`All the model of ${khang.accountId}:  ${model}`);
//   // }catch(e){
//   //   console.log(e)
//   // };
//   // console.log(model);
//   // t.is(models.containsKey('googleGPT'), true, "Contain google model");
//   // t.is(models.containsKey('ChatGPT'), true, "Contain chatgpt");
// });
test("Add model", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, neurocoinFt, khang, hien, models;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, neurocoinFt = _a.neurocoinFt, khang = _a.khang, hien = _a.hien;
                khang.call(neurocoinFt, "add_model", {
                    modelName: "ChatGPT",
                });
                khang.call(neurocoinFt, "add_model", {
                    modelName: "googleGPT",
                });
                return [4 /*yield*/, neurocoinFt.view("get_models_of", {
                        accountId: khang.accountId
                    })];
            case 1:
                models = _b.sent();
                console.log(models);
                return [2 /*return*/];
        }
    });
}); });
test("Use the model", function (t) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, neurocoinFt, khang, hien, khangAfterBalance;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = t.context.accounts, neurocoinFt = _a.neurocoinFt, khang = _a.khang, hien = _a.hien;
                khang.call(neurocoinFt, "add_model", {
                    modelName: "ChatGPT",
                });
                khang.call(neurocoinFt, "add_model", {
                    modelName: "googleGPT",
                });
                hien.call(neurocoinFt, "use_model", {
                    receiverId: khang.accountId,
                    modelName: "ChatGPT",
                    amount: 10,
                }, {
                    attachedDeposit: NEAR.parse("10 N").toJSON()
                });
                return [4 /*yield*/, khang.balance()];
            case 1:
                khangAfterBalance = _b.sent();
                t.true(khangAfterBalance.total >= NEAR.parse("10 N").toJSON(), "The balance should be greater than 10");
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5hdmEuanMiLCJzb3VyY2VSb290IjoiL2hvbWUva2hhbmcvRGVza3RvcC9oYWNrYXRob24vTmV1cm9Db2luLyIsInNvdXJjZXMiOlsic2FuZGJveC10cy9tYWluLmF2YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBZSxNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8sT0FBbUIsTUFBTSxLQUFLLENBQUM7QUFFdEMsSUFBTSxJQUFJLEdBQUcsT0FBbUUsQ0FBQztBQUNqRixJQUFJLENBQUMsVUFBVSxDQUFDLFVBQU8sQ0FBQzs7OztvQkFFUCxxQkFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUE7O2dCQUE1QixNQUFNLEdBQUcsU0FBbUI7Z0JBRTVCLFdBQVcsR0FBRyxHQUFHLENBQUM7Z0JBR2xCLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO2dCQUlaLHFCQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsRUFBQTs7Z0JBQTVELFdBQVcsR0FBRyxTQUE4QztnQkFLcEQscUJBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFBOztnQkFBNUMsS0FBSyxHQUFHLFNBQW9DO2dCQUNyQyxxQkFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUE7O2dCQUExQyxJQUFJLEdBQUcsU0FBbUM7Z0JBR2hELG1CQUFtQjtnQkFDbkIscUJBQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFO3dCQUNwQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7d0JBQzFCLFdBQVcsRUFBRyxXQUFXLENBQUMsUUFBUSxFQUFFO3FCQUNyQyxDQUFDO29CQUVGLDBCQUEwQjtrQkFGeEI7O2dCQUpGLG1CQUFtQjtnQkFDbkIsU0FHRSxDQUFBO2dCQUVGLDBCQUEwQjtn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