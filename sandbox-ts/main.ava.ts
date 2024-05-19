import { Worker, NEAR, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from 'ava';

const test = anyTest as TestFn<{ worker: Worker, accounts: any, variables: any}>;
test.beforeEach(async (t) => {
  //Init the worker and start a Sandbox server
  const worker = await Worker.init();

  const totalSupply = 1e6;

  // Prepare sandbox for test,...
  const root = worker.rootAccount;

  // console.log("I'm here");
  //Deploy the contract
  const neurocoinFt = await root.devDeploy("./build/neurocoin.wasm");


  // console.log("Deploy successfully");
  //Test users
  const khang = await root.createSubAccount('khang');
  const hien = await root.createSubAccount('hien');

  
  //Init the contract
  await khang.call(neurocoinFt, "init", {
    accountId: khang.accountId,
    totalSupply : totalSupply.toString() 
  })

  //Save state for test runs
  t.context.worker = worker;
  t.context.accounts = {root, neurocoinFt, khang, hien};
 });

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("Owner initial details",  async (t) =>{
  const {neurocoinFt, khang} = t.context.accounts; 

  const totalSupply = await neurocoinFt.view("get_total_supply", {});

  t.is(totalSupply, '1000000', "The total supply should be 1,000,000"); 
  
  // console.log(totalSupply);
  // return true;
});

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

test("Add model", async (t) => {
  const {neurocoinFt, khang, hien} = t.context.accounts;
  khang.call(neurocoinFt, "add_model", {
    modelName: "ChatGPT",
  });

  khang.call(neurocoinFt, "add_model", {
    modelName: "googleGPT",
  });

  let models = await neurocoinFt.view("get_models_of", {
    accountId : khang.accountId
  });

  console.log(models);

});

test("Use the model", async (t) =>{
  const {neurocoinFt, khang, hien} = t.context.accounts;
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
  })
  
  const khangAfterBalance = await khang.balance();

  t.true(khangAfterBalance.total >= NEAR.parse("10 N").toJSON(), "The balance should be greater than 10")
});
