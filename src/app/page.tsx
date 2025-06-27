/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { 
  AccountStorageMode,
  WebClient
} from "@demox-labs/miden-sdk";

export default function Home() {
  const [webClient, setWebClient] = useState<WebClient | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [consumableNotes, setConsumableNotes] = useState<any[]>([]);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Initialize Miden client
  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await WebClient.createClient();
        setWebClient(client);
        setSdkLoaded(true);
        console.log('Miden client initialized');
      } catch (error) {
        console.error('Failed to initialize Miden client:', error);
        setTransactionStatus('Failed to initialize Miden client. Please check your connection.');
      }
    };
    initClient();
  }, []);

  const createWallet = async () => {
    if (!webClient) {
      setTransactionStatus('Client not initialized');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('Creating new Miden wallet...');

    try {
      const accountStorageMode = AccountStorageMode.private();
      const mutable = true;
      
      const newAccount = await webClient.newWallet(accountStorageMode, mutable);
      console.log('Created account:', newAccount);
      console.log('Account ID:', newAccount.id().toString());
      console.log('Account type:', typeof newAccount);
      console.log('Account constructor:', newAccount.constructor.name);
      
      setAccount(newAccount);
      setIsConnected(true);
      
      setTransactionStatus(`✅ Wallet created! Account ID: ${newAccount.id().toString()}`);
      
      // Sync state immediately with the new account
      console.log('Syncing state after wallet creation...');
      await syncState(newAccount);
      
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setTransactionStatus('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncState = async (accountToUse?: any) => {
    const targetAccount = accountToUse || account;
    
    if (!webClient || !targetAccount) {
      console.log('Cannot sync: webClient or account not available');
      console.log('webClient:', !!webClient);
      console.log('targetAccount:', !!targetAccount);
      return;
    }

    try {
      console.log('Syncing state with account:', targetAccount);
      await webClient.syncState();
      
      // Use the account ID instead of the account object
      const accountId = targetAccount.id();
      console.log('Getting consumable notes for account ID:', accountId);
      const notes = await webClient.getConsumableNotes(accountId);
      console.log('Found notes:', notes);
      
      setConsumableNotes(notes);
      
      // Calculate balance from notes
      let totalBalance = 0;
      notes.forEach((note: any) => {
        // This is a simplified balance calculation
        // In a real app, you'd need to check the specific asset type
        totalBalance += 1; // Assuming each note represents 1 token for demo
        console.log('Processing note:', note); // Use the note variable
      });
      setBalance(totalBalance);
      
      setTransactionStatus(`✅ Synced state successfully. Found ${notes.length} consumable notes.`);
      
    } catch (error) {
      console.error('Failed to sync state:', error);
      setTransactionStatus(`Failed to sync state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const consumeNote = async () => {
    if (!webClient || !account || consumableNotes.length === 0) {
      setTransactionStatus('No notes available to consume');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('Consuming note and generating proof...');

    try {
      const noteToConsume = consumableNotes[0];
      console.log('Note to consume:', noteToConsume);
      console.log('Note type:', typeof noteToConsume);
      console.log('Note constructor:', noteToConsume.constructor.name);
      
      // Get the note ID and convert to string immediately to avoid ownership issues
      const noteId = noteToConsume.inputNoteRecord().id();
      const noteIdString = noteId.toString();
      console.log('Note ID string:', noteIdString);
      
      // Create a fresh note ID from the string to avoid Rust ownership issues
      const consumeTransactionRequest = webClient.newConsumeTransactionRequest([
        noteIdString,
      ]);

      const consumeTransactionResult = await webClient.newTransaction(
        account,
        consumeTransactionRequest
      );

      setTransactionStatus('Submitting transaction to network...');
      
      await webClient.submitTransaction(consumeTransactionResult);
      
      setTransactionStatus('✅ Note consumed successfully! Syncing state...');
      
      // Sync state to update balance
      await syncState();
      
    } catch (error) {
      console.error('Failed to consume note:', error);
      setTransactionStatus(`Failed to consume note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webClient || !account) {
      setTransactionStatus('Wallet not connected');
      return;
    }

    if (!recipientAddress || !amount || parseFloat(amount) <= 0) {
      setTransactionStatus('Please enter valid recipient address and amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      setTransactionStatus('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setTransactionStatus('Creating and sending note...');

    try {
      // This is a simplified note creation
      // In a real app, you'd need to create proper note scripts and assets
      setTransactionStatus('Note creation not yet implemented in this demo');
      
      // For now, just simulate the process
      setTimeout(() => {
        setTransactionStatus('✅ Note sent successfully! (Demo mode)');
        setRecipientAddress('');
        setAmount('');
        setNote('');
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to send note:', error);
      setTransactionStatus('Failed to send note. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Miden Note Sender
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real Miden blockchain integration
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* SDK Loading Status */}
          {!sdkLoaded && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Loading Miden SDK
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Initializing Miden client and loading WebAssembly modules...
              </p>
            </div>
          )}

          {/* Wallet Creation */}
          {sdkLoaded && !isConnected && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create Miden Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create a new private Miden wallet to start sending notes.
              </p>
              <button
                onClick={createWallet}
                disabled={isLoading || !webClient}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {!webClient ? 'Initializing...' : isLoading ? 'Creating...' : 'Create Wallet'}
              </button>
            </div>
          )}

          {isConnected && (
            <>
              {/* Wallet Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Wallet Connected
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {account?.id().toString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Balance (Consumable Notes)
                    </label>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {balance} notes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => syncState()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Sync State
                    </button>
                    <button
                      onClick={() => {
                        console.log('Current account:', account);
                        console.log('Account type:', typeof account);
                        if (account) {
                          console.log('Account ID:', account.id().toString());
                        }
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Debug Account
                    </button>
                    {consumableNotes.length > 0 && (
                      <button
                        onClick={consumeNote}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Consume Note
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Send Note Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Send Note
                </h2>
                
                <form onSubmit={sendNote} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Enter recipient account ID..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a message to your note..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Processing...' : 'Send Note'}
                  </button>
                </form>
              </div>

              {/* Transaction Status */}
              {transactionStatus && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {transactionStatus}
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  How to Test
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>1. <strong>Create wallet</strong> - Generates a real Miden private account</p>
                  <p>2. <strong>Get test tokens</strong> - Visit <a href="https://faucet.testnet.miden.io/" target="_blank" className="text-purple-600 hover:underline">Miden Faucet</a> and send tokens to your account ID</p>
                  <p>3. <strong>Sync state</strong> - Click &quot;Sync State&quot; to check for new notes</p>
                  <p>4. <strong>Consume notes</strong> - Convert notes to spendable balance</p>
                  <p>5. <strong>Send notes</strong> - Create and send notes to other addresses</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
