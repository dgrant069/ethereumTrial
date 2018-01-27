const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const provider = ganache.provider()
const web3 = new Web3(provider)

const { interface, bytecode } = require('../compile')
let accounts, lottery;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();
  // Use one of those accounts to deploy the contract
  // "arguments" is the list of params sent to the constructor
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })

  // ADD THIS ONE LINE RIGHT HERE!!!!! <---------------------
  lottery.setProvider(provider)
});

describe('Lottery', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address)
  })

  it('allows a player to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.01', 'ether')
    })
    const players = await lottery.methods.getPlayers().call({ from: accounts[0] })
    assert.equal(accounts[0], players[0])
    assert.equal(1, players.length)
  });

})
