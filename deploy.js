const HdWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

const env = require('./envs/constants');
const { interface, bytecode } = require('./compile')

const provider = new HdWalletProvider(
  env.DEV_MNEMONIC,
  `https://ropsten.infura.io/${env.INFURA_API_KEY}`
)
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()

  console.log('accounts', accounts[0])

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })

  console.log('result from deploy', result)
  return result
}

deploy()
