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
})

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
  })

  it('allows multiple players to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.01', 'ether')
    })
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    })
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.03', 'ether')
    })

    const players = await lottery.methods.getPlayers().call({ from: accounts[0] })
    assert.equal(accounts[2], players[2])
    assert.equal(3, players.length)
  })

  it('requires a min amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: '10'
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('only manager can call pick winner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('sends money to the winner and resets the players', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    })

    const initialBalance = await web3.eth.getBalance(accounts[0])
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    })
    const finalBalance = await web3.eth.getBalance(accounts[0])
    const difference = finalBalance - initialBalance
    const players = await lottery.methods.getPlayers().call({ from: accounts[0] })
    console.log('ether difference: ', difference)

    assert(difference > web3.utils.toWei('1.8', 'ether'))
    assert.equal(0, players.length)
  })
})
