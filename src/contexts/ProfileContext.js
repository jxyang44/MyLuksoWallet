//context provider to manage extension connection, Universal Profile state, keymanager, etc.

import React, { useState, createContext, useContext } from "react";
import Web3 from "web3";
import {
  LSP3Schema,
  UniversalProfileContract,
  LSP6Contract,
  LSP9Contract,
  web3Provider,
  LSP6Schema,
  LSP1Schema,
  LSP10Schema,
  createErc725Instance,
  INTERFACE_IDS
} from "../utils/luksoConfigs";
import { useStateContext } from "./StateContext";
import swal from "sweetalert";

require("isomorphic-fetch");
const ProfileContext = createContext();
const { ethereum } = window;
export let web3Window;

export const ProfileProvider = ({ children }) => {

  //https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-3-UniversalProfile-Metadata.md#lsp3profile
  const defaultMetadata = {
    name: "My username",
    description: "My description",
    links: [],
    tags: [],
    avatar: [],
    profileImage: [],
    backgroundImage: [],
  };

  const defaultAddresses = {
    permissions: [], //array of all permissed accounts
    URD: "", //address of Universal Receiver Delegate
    KM: "", //address of Key Manager
    vaults: [], //array of all LSP10 Received Vaults for the connected Universal Profile
  };

  const { setTheme, setUPColor, setUPTextColor, setThemeDefaults } = useStateContext(); //state variables for website themes, fetched from UP metadata
  const [currentAccount, setCurrentAccount] = useState(""); // current UP address
  const [isProfileLoaded, setIsProfileLoaded] = useState(false); // true if profile metadata is fetched
  const [profileJSONMetadata, setProfileJSONMetadata] = useState(defaultMetadata); // profile metadata - should always be in sync with JSON metadata on IPFS
  const [pendingProfileJSONMetadata, setPendingProfileJSONMetadata] = useState(defaultMetadata); // keeps track of pending profile metadata that the user makes locally, but hasn't committed to uploading to the blockchain
  const [useRelay, setUseRelay] = useState(false); // true if user has enabled relay transaction service
  const [accountAddresses, setAccountAddresses] = useState(defaultAddresses); // stores permissions, URD, vault, and key manager addresses for the connected UP

  //@desc connects to the UPextension, sets the Universal Profile address state, and fetches profile metadata
  const connectProfile = async () => {
    try {
      if (!ethereum) return swal("Wallet not detected.", "", "error");
      if (ethereum.isMetaMask)
        return swal(
          "MyLuksoWallet is designed to work with the Universal Profile extension.",
          "Please switch to the UP extension and refresh the page.",
          "warning"
        );

      web3Window = new Web3(window.ethereum);
      const accounts = await web3Window.eth.requestAccounts();
      setCurrentAccount(accounts[0]); //TO-DO use-reducer for these three
      fetchProfileMetadata(accounts[0]);
      setAccountAddressesFunction(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAddresses = async address => {
    const getPermissions = async address => {
      const profile = createErc725Instance(LSP6Schema, address);
      return await profile.fetchData();
    };
    const getURD = async address => {
      const profile = createErc725Instance(LSP1Schema, address);
      return await profile.fetchData();
    };
    const getVaults = async address => {
      const profile = createErc725Instance(LSP10Schema, address);
      return await profile.fetchData();
    };
    const getKM = async address => {
      const universalProfileContract = new web3Provider.eth.Contract(UniversalProfileContract.abi, address);
      return await universalProfileContract.methods.owner().call();
    };

    return Promise.all([getPermissions(address), getURD(address), getVaults(address), getKM(address)]);
  };

  //address should only be universal profile
  const setAccountAddressesFunction = address => {
    fetchAddresses(address).then(res =>
      setAccountAddresses(current => ({
        ...current,
        permissions: res[0][0].value,
        URD: res[1][0].value,
        vaults: res[2][0].value,
        KM: res[3],
      }))
    );
  };

  const loginWithKey = keyType => {
    swal(`Login with ${keyType}:`, {
      content: "input",
      button: true,
    })
      .then(value => {
        if (value) {
          // if (keyType === "Private Key") connectProfileUsingPrivateKey(value);
          if (keyType === "UP Address") connectProfileUsingUPAddress(value);
        } else {
          swal("No input detected.");
        }
      })
      .catch(() => {
        swal("Something went wrong.", "Please try again later.", "warning");
      });
  };

  const connectProfileUsingUPAddress = async UPAddress => {
    try {
      disconnectUPExtension();
      setCurrentAccount(UPAddress);
      fetchProfileMetadata(UPAddress);
      setAccountAddressesFunction(UPAddress);
    } catch (error) {
      console.log(error);
    }
  };

  const getPermissionsOfAddresses = async (address, addressOf) => {
    if (!addressOf) addressOf = currentAccount;
    const erc725 = createErc725Instance(LSP6Schema, addressOf);
    const addressPermission = await erc725.getData({
      keyName: "AddressPermissions:Permissions:<address>",
      dynamicKeyParts: address,
    });
    return erc725.decodePermissions(addressPermission.value);
  };

  //TO-DO come back to this - not working
  const activateAccountChangedListener = () => {
    window.ethereum.on("accountsChanged", accounts => {
      disconnectUPExtension();
      setCurrentAccount(accounts[0]);
      fetchProfileMetadata(accounts[0]);
      setAccountAddressesFunction(accounts[0]);
      console.log("------- UP extension account switched to: ------", accounts[0]);
    });
  };

  //https://docs.lukso.tech/guides/universal-profile/read-profile-data
  async function fetchProfileData(address) {
    try {
      const profile = createErc725Instance(LSP3Schema, address);
      swal("Fetching profile data...", { button: false });
      return await profile.fetchData("LSP3Profile");
    } catch (error) {
      swal(`Could not fetch LSP3 Universal Profile Metadata.`, "", "error");
      setCurrentAccount("");
    }
  }

  //add a new permissions
  //privateKey is optional
  async function addNewPermission(addressFrom, addressTo, permissions, privateKey) {
    if (!currentAccount) return swal("You are not connected to an account.");
    if (!addressFrom || !addressTo || !permissions) return swal("A required address was not provided.");
    if (addressFrom !== currentAccount && !privateKey) return swal("You must provide a private key to add permissions to a vault. 👷");
    try {
      swal(`Adding new permissions for ${addressTo} to ${addressFrom}...`, { button: false });

      const erc725 = createErc725Instance(LSP6Schema, addressFrom);

      // key1: increment length of AddressPermissions[]
      const permissionsArray = await erc725.getData("AddressPermissions[]");
      const addressLengthKey = permissionsArray.key; //0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3
      const currentPermissionsCount = permissionsArray?.value.length ?? 0;
      const newPermissionsCount = "0x" + ("0".repeat(64 - (currentPermissionsCount + 1).toString().length) + (currentPermissionsCount + 1));

      // key2: get index of beneficiary in AddressPermissions[]
      const beneficiaryIndexKey = addressLengthKey.slice(0, 34) + "0000000000000000000000000000000" + currentPermissionsCount;
      const beneficiaryAddress = addressTo;

      //console.log(permissionsArray, currentPermissionsCount, newPermissionsCount, addressLengthKey);

      // key3: permissions of the beneficiary address
      swal("Encoding permissions...", { button: false });
      const beneficiaryPermissions = erc725.encodePermissions(permissions);
      const data = erc725.encodeData({
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: beneficiaryAddress,
        value: beneficiaryPermissions,
      });

      const myUniversalProfile = new web3Window.eth.Contract(UniversalProfileContract.abi, currentAccount);

      //Universal Profile
      if (currentAccount === addressFrom) {
        swal("Updating permissions. Please confirm...", { button: false });
        return await myUniversalProfile.methods["setData(bytes32[],bytes[])"](
          [
            addressLengthKey, // length of AddressPermissions[]
            beneficiaryIndexKey, // index of beneficiary in AddressPermissions[]
            data.keys[0], // permissions of the beneficiary
          ],
          [newPermissionsCount, beneficiaryAddress, data.values[0]]
        ).send({ from: currentAccount, gasLimit: 300_000 });
      } else {
        //Vault
        const myEOA = web3Window.eth.accounts.wallet.add(privateKey);
        
        const payload = myUniversalProfile.methods["setData(bytes32[],bytes[])"](
          [
            addressLengthKey, // length of AddressPermissions[]
            beneficiaryIndexKey, // index of beneficiary in AddressPermissions[]
            data.keys[0], // permissions of the beneficiary
          ],
          [newPermissionsCount, beneficiaryAddress, data.values[0]]
        );
        swal("Fetching key manager address...", { button: false });
        const keyManagerAddress = await myUniversalProfile.methods.owner().call();
        const keyManagerContract = new web3Window.eth.Contract(LSP6Contract.abi, keyManagerAddress);
        swal("Setting permissions...", { button: false });
        return await keyManagerContract.methods.execute(payload.encodeABI()).send({
          from: myEOA.address,
          gasLimit: 600_000,
        });
      }
    } catch (error) {
      console.log(error);
      swal("Something went wrong.", JSON.stringify(error), "warning");
    }
  }


  const isVault = async walletAddress => {
    try {
      const contractInstance = new web3Provider.eth.Contract(LSP9Contract.abi, walletAddress);
      return await contractInstance.methods.supportsInterface(INTERFACE_IDS["LSP9Vault"]).call();
    } catch (err) {
      console.log(err);
      swal("Warning! Could not determine if this address supports the LSP9Vault interface.", "Proceed with caution.", "warning");
    }
  };


  //update permissions for existing account
  async function updateExistingPermission(addressFrom, addressTo, permissions) {
    if (!currentAccount) return swal("You are not connected to an account.");
    //check is already a permission
    //console.log(getPermissionsOfAddresses(addressTo, addressFrom))
    if (!addressFrom || !addressTo || !permissions) return swal("A required address was not provided.");
    try {
      swal(`Updating permissions for ${addressTo} on ${addressFrom}...`, { button: false });

      const erc725 = createErc725Instance(LSP6Schema, addressFrom);

      swal("Encoding permissions...", { button: false });
      const beneficiaryAddress = addressTo;
      console.log(permissions);
      const beneficiaryPermissions = erc725.encodePermissions(permissions);
      console.log(beneficiaryPermissions);

      const data = erc725.encodeData({
        keyName: "AddressPermissions:Permissions:<address>",
        dynamicKeyParts: beneficiaryAddress,
        value: beneficiaryPermissions,
      });

      const myUniversalProfile = new web3Window.eth.Contract(UniversalProfileContract.abi, currentAccount);
      swal("Updating permissions...", { button: false });

      return await myUniversalProfile.methods["setData(bytes32,bytes)"](data.keys[0], data.values[0]).send({
        from: currentAccount,
        gasLimit: 300_000,
      });
    } catch (error) {
      console.log(error);
      swal("Something went wrong.", JSON.stringify(error), "warning");
    }
  }

  const getAccountType = async address => {
    try {
      return await web3Provider.eth.getCode(address).then(res => {
        if (res === "0x") {
          return "EOA";
        } else {
          return "ERC725";
        }
      });
    } catch {
      return "Invalid";
    }
  };

  //@param imageArray array of images from LSP3Profile metadata (e.g. profileImage, backgroundImage)
  //@param maxSize maximum width of the image allowed in returned index
  //@returns the array index of the image with the largest width <= maxSize
  //TO-DO
  const maxImageIndex = (imageArray, maxSize) => {
    return 0;
  };

  //@desc initializes Universal Profile state variables, called by connectProfile(), which is called when the user connects to the extension
  //@param address Universal Profile address
  //@param profileData promise JSON of profile data
  //@param setProfileJSONMetadata React state setter for initial profile metadata
  //@param setPendingProfileJSONMetadata equal to setProfileJSONMetadata on initialization
  //@param setIsProfileLoaded React state setter indicating that profile metadata is loaded
  async function fetchProfileMetadata(address) {
    const profileData = await fetchProfileData(address);
    if (profileData === undefined) return;
    if (profileData.value !== null) {
      setProfileJSONMetadata(current => ({
        ...current,
        ...profileData.value.LSP3Profile,
      }));
      setPendingProfileJSONMetadata(current => ({
        ...current,
        ...profileData.value.LSP3Profile,
      }));

      setTheme(profileData.value.LSP3Profile.MLWTheme); //MLW website theme
      setUPColor(profileData.value.LSP3Profile.MLWUPColor); //MLW UP background color
      setUPTextColor(profileData.value.LSP3Profile.MLWUPTextColor); //MLW UP text color
      setIsProfileLoaded(true);
      swal("Your account is now connected to MyLuksoWallet.", `Welcome ${profileData.value.LSP3Profile.name}!`, "success");
    } else {
      // const contractInstance = new web3Provider.eth.Contract(LSP9Contract.abi, address);
      // const isVault = await contractInstance.methods.supportsInterface(INTERFACE_IDS[interfaceType]).call();

      setIsProfileLoaded(true);
      swal("Your account is now connected to MyLuksoWallet.", "No initial profile metadata was found for this account.", "warning");
    }
  }

  //@desc resets all profile state variables to their default values
  //@desc does not actually "disconnect" the login from the extension - user must do that manually in the extension
  const disconnectUPExtension = () => {
    setProfileJSONMetadata(defaultMetadata);
    setPendingProfileJSONMetadata(defaultMetadata);
    setAccountAddresses(defaultAddresses);
    setIsProfileLoaded(false);
    setCurrentAccount("");
    setThemeDefaults();
  };

  
  //TO-DOthis function is currently not used
  const executeViaKeyManager = async (functionABI, swalMessage) => {
    return;
    // try {
    //   if (currentAccount === "") return swal("Please connect to a Universal Profile.", "", "warning");
    //   console.log("initiating key manager");

    //   const universalProfileContract = new web3Window.eth.Contract(UniversalProfileContract.abi, currentAccount);

    //   swal("Using relay service...", "Fetching key manager address...", { button: false });
    //   const keyManagerAddress = await universalProfileContract.methods.owner().call();
    //   const keyManagerContract = new web3Window.eth.Contract(LSP6Contract.abi, keyManagerAddress);

    //   const myEOA = web3Window.eth.accounts.wallet.add(MM_PrivateKey);

    //   const abiPayload = functionABI();
    //   swal(swalMessage, { button: false });

    //   const channelId = 0;
    //   swal("Using relay service...", "Establishing key manager nonce...", { button: false });
    //   const nonce = await keyManagerContract.methods.getNonce(myEOA.address, channelId).call();

    //   const message = web3Window.utils.soliditySha3(chainId, keyManagerAddress, nonce, {
    //     t: "bytes",
    //     v: abiPayload,
    //   });

    //   swal("Using relay service...", "Signing the transaction...", { button: false });
    //   const signatureObject = myEOA.sign(message);
    //   const signature = signatureObject.signature;
    //   //const signatureObject2 = web3Window.eth.sign(message, keyManagerAddress);

    //   swal("Using relay service...", "Executing the transaction...", { button: false });
    //   return await keyManagerContract.methods.executeRelayCall(signature, nonce, abiPayload).send({ from: myEOA.address, gasLimit: 300_000 });
    // } catch (error) {
    //   swal("Something went wrong.", JSON.stringify(error), "warning");
    //   console.log(error);
    // }
  };

  //function for if MLW is granted permission to account
  //NOT USED
  // const executeViaKeyManagerPermissioned = async (functionABI, swalMessage, fromVault, vaultAddress) => {
  //   if (currentAccount === "") return swal("Please connect to a Universal Profile.", "", "warning");
  //   console.log("initiating key manager");
  //   const myEOA = web3Provider.eth.accounts.wallet.add(MM_PrivateKey);
  //   const myUP = new web3Provider.eth.Contract(UniversalProfileContract.abi, currentAccount);
  //   let abiPayload;
  //   if (fromVault) {
  //     const vaultPayload = functionABI();
  //     console.log("vault payload", vaultPayload);
  //     abiPayload = myUP.methods.execute(0, vaultAddress, 0, vaultPayload).encodeABI();
  //   } else {
  //     abiPayload = functionABI();
  //   }
  //   console.log("final payload", abiPayload);
  //   swal("Fetching key manager address...", { button: false });
  //   const keyManagerAddress = await myUP.methods.owner().call();
  //   const myKM = new web3Provider.eth.Contract(LSP6Contract.abi, keyManagerAddress);
  //   swal(swalMessage, { button: false });
  //   return await myKM.methods.execute(abiPayload).send({ from: myEOA.address, gasLimit: 300_000 });
  // };

  return (
    <ProfileContext.Provider
      value={{
        defaultMetadata,
        connectProfile,
        loginWithKey,
        connectProfileUsingUPAddress,
        currentAccount,
        setCurrentAccount,
        profileJSONMetadata,
        setProfileJSONMetadata,
        pendingProfileJSONMetadata,
        setPendingProfileJSONMetadata,
        isProfileLoaded,
        setIsProfileLoaded,
        maxImageIndex,
        disconnectUPExtension,
        fetchProfileMetadata,
        activateAccountChangedListener,
        web3Window,
        useRelay,
        setUseRelay,
        executeViaKeyManager,
        accountAddresses,
        setAccountAddresses,
        getPermissionsOfAddresses,
        fetchAddresses,
        getAccountType,
        addNewPermission,
        updateExistingPermission,
        isVault
      }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
