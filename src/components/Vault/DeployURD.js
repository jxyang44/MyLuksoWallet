//deploys a URD and stores the address in localstorage

import React from "react";
import { useProfileContext } from "../../contexts/ProfileContext";
import { VaultStep } from ".";
import { LSP1VaultContract } from "../../utils/luksoConfigs";
import swal from "sweetalert";

const DeployURD = ({ recentVaultURDAddress, setRecentVaultURDAddress }) => {
  const { web3Window, currentAccount } = useProfileContext();

  //deploys URD
  //https://docs.lukso.tech/guides/vault/create-a-vault
  //https://docs.lukso.tech/guides/vault/edit-vault-data
  const handleDeployVaultURD = () => {
    if (currentAccount === "") return swal("Please connect to a Universal Profile.", "", "warning");
    const deployVault = async () => {
      try {
        const myURDVault = new web3Window.eth.Contract(LSP1VaultContract.abi);
        return await myURDVault
          .deploy({
            data: LSP1VaultContract.bytecode,
          })
          .send({
            from: currentAccount,
            gas: 5_000_000,
            gasPrice: "1000000000",
          })
          .on("receipt", receipt => {
            console.log(receipt);
            localStorage.setItem("recentLSP9URDAddress", receipt.contractAddress);
            setRecentVaultURDAddress(receipt.contractAddress);
          })
          .once("sending", payload => {
            swal(
              "Deploying vault universal receiver delegate.",
              "The deployment process will begin once the transaction is confirmed. Please wait...",
              { button: false }
            );
            console.log(payload);
          })
          .on("error", error => console.log(error));
      } catch (error) {
        console.log(error);
        swal("Something went wrong.", JSON.stringify(error), "warning");
      }
    };

    deployVault().then(res => {
      if (res) swal(`Congratulations! Your URD at address ${recentVaultURDAddress} has deployed!`, "", "success");
    });
  };

  return (
    <VaultStep
      buttonText="2. Deploy Vault URD"
      buttonFunc={handleDeployVaultURD}
      inputLabel1="Most Recently Deployed Vault URD from this Browser"
      inputValue1={recentVaultURDAddress}
    />
  );
};

export default DeployURD;
