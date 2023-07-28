import { apolloClient } from "../../apollo/apolloClient";
import { LAST_EVENT_QUERY } from "../../gql";
import { getContractCreationTxn } from "../../utils";
import { viemClient } from "../../viem/client";
import env from '../../services/env';

export async function getLastBlockNum() {
    const { data } = await apolloClient.query({ query: LAST_EVENT_QUERY, variables: { owner: env.OWNER } });
    const apiUrl = `https://api-goerli-optimistic.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${env.CONTRACT_ADDRESS}&apikey=${env.OPTIMISM_GOERLI_API_KEY}`;
  
    if (!data.transactions.edges.length) {
      const txn = await getContractCreationTxn(apiUrl);
      const txnResult = txn?.result?.[0];
      if (!txnResult) {
        console.error('No contract creation transaction found or an error occurred while fetching');
        return;
      }
  
      const txnHash = txnResult.txHash;
      console.log('contractCreationTxn:', txn, 'contract transaction hash:', txnHash);
  
      const { blockNumber } = await viemClient.getTransaction({ hash: txnHash });
      console.log(`Starting indexing when contract was created @ block number: ${blockNumber}`);
  
      return blockNumber;
    }
  
    const txnId = data.transactions.edges[0].node.id;
    const [txnData] = await (await fetch(`https://arweave.net/${txnId}`)).json();
  
    console.log('transactiondata', txnData);
    return txnData?.blockNumber;
  }