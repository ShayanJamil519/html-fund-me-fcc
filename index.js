import { ethers } from './ethers-5.6.esm.min.js'
import { abi, contractAddress } from './constants.js'
// ==================================

const connectButton = document.getElementById('connectButton')
const balanceButton = document.getElementById('balanceButton')
const withdrawButton = document.getElementById('withdrawButton')
const fundButton = document.getElementById('fund')
connectButton.onclick = connect
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
fundButton.onclick = fund

// ==========================
async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = 'Connected'
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        console.log(accounts)
    } else {
        connectButton.innerHTML = 'Please install MetaMask'
    }
}

// console.log(ethers)
// ================================
async function fund() {
    const ethAmount = document.getElementById('ethAmount').value
    console.log(`Funding with ${ethAmount} ...`)
    if (typeof window.ethereum !== 'undefined') {
        // To Send Transaction to some contract we need 3 things
        // Provider => Connection to Blockchain
        // Signer => Wallet / Someone who has some gas
        // Contract => contract that we are interacting with - For Contract we need : ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                    value: ethers.utils.parseEther(ethAmount),
                })
                // Listen for the transaction to be mined
                // Listen for an event
            await listenForTransactionMine(transactionResponse, provider) // wait until this function is completed
            console.log('Done')
        } catch (error) {
            console.log(error)
        }
    }
}

async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    } else {
        balanceButton.innerHTML = 'Please install MetaMask'
    }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
                // await transactionResponse.wait(1)
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawButton.innerHTML = 'Please install MetaMask'
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining...${transactionResponse.hash}`)
        // listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            //once the transactionResponse.hash happens then the listener function  |  ()=>{}  | will exceute
            console.log(
                `Completed with ${transactionReceipt.confirmations} confiramtions`,
            )
            resolve()
        })
    })
}