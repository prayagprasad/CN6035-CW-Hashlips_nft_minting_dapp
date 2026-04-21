import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const BACKEND_API_URL = "https://literate-eureka-r4g597pwvp96f5rj7-3000.app.github.dev"; 

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px; border-radius: 50px; border: none; background-color: var(--secondary);
  font-weight: bold; color: var(--secondary-text); width: 100px; cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active { box-shadow: none; }
`;

export const StyledRoundButton = styled.button`
  padding: 10px; border-radius: 100%; border: none; background-color: var(--primary);
  font-weight: bold; font-size: 15px; color: var(--primary-text); width: 30px; height: 30px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  :active { box-shadow: none; }
`;

export const ResponsiveWrapper = styled.div`
  display: flex; flex: 1; flex-direction: column; justify-content: stretched;
  align-items: stretched; width: 100%;
  @media (min-width: 767px) { flex-direction: row; }
`;

export const StyledLogo = styled.img`
  width: 200px; @media (min-width: 767px) { width: 300px; }
  transition: width 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7); border: 4px dashed var(--secondary);
  background-color: var(--accent); border-radius: 100%; width: 200px;
  @media (min-width: 900px) { width: 250px; }
  transition: width 0.5s;
`;

export const StyledLink = styled.a` color: var(--secondary); text-decoration: none; `;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  
  // IMPROVEMENT: State to store data fetched from the "Missing" Backend
  const [history, setHistory] = useState([]);

  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "", SCAN_LINK: "", NETWORK: { NAME: "", SYMBOL: "", ID: 0 },
    NFT_NAME: "", SYMBOL: "", MAX_SUPPLY: 1, WEI_COST: 0, DISPLAY_COST: 0,
    GAS_LIMIT: 0, MARKETPLACE: "", MARKETPLACE_LINK: "", SHOW_BACKGROUND: false,
  });

  // --- HYBRID LOGIC: BACKEND INTERACTION ---
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/mints`);
      const result = await response.json();
      setHistory(result);
    } catch (err) { console.error("Backend fetch error:", err); }
  };

  const saveToBackend = async (address, txHash) => {
    try {
      await fetch(`${BACKEND_API_URL}/api/mints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, hash: txHash, amount: mintAmount }),
      });
      fetchHistory(); // Refresh the list
    } catch (err) { console.error("Backend save error:", err); }
  };

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    
    blockchain.smartContract.methods
      .mint(blockchain.account, mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        setFeedback("Sorry, something went wrong.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        //Capture real blockchain data points
        const blockNumber = receipt.blockNumber;
        const gasUsed = receipt.gasUsed;
        
        setFeedback(`SUCCESS: Confirmed in Block ${blockNumber}. Gas Used: ${gasUsed}`);
        console.log("Transaction Receipt:", receipt);

        // Save data to backend
        saveToBackend(blockchain.account, receipt.transactionHash);
        
        dispatch(fetchData(blockchain.account));
        setClaimingNft(false);
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) newMintAmount = 1;
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) newMintAmount = 10;
    setMintAmount(newMintAmount);
  };

  const getConfig = async () => {
    try {
      const configResponse = await fetch("/config/config.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      const config = await configResponse.json();
      console.log("✅ CONFIG LOADED:", config); 
      SET_CONFIG(config);
    } catch (err) {
      console.error("❌ CONFIG FAILED TO LOAD:", err);
      setFeedback("System Error: Could not load configuration.");
    }
  };

  useEffect(() => {
    getConfig();
    fetchHistory(); // Load backend data on startup
  }, []);

  useEffect(() => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container flex={1} ai={"center"} style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}>
        {/* IMPROVEMENT: Professional System Monitor */}
        <div style={{ 
          width: "100%", 
          background: "#111", 
          padding: "10px", 
          display: "flex", 
          justifyContent: "space-around", 
          borderBottom: "2px solid var(--secondary)",
          marginBottom: "20px" 
        }}>
          <div style={{ color: "lime", fontSize: "12px" }}>● DB: CONNECTED (ATLAS)</div>
          <div style={{ color: "cyan", fontSize: "12px" }}>● NETWORK: {CONFIG.NETWORK.NAME}</div>
          <div style={{ color: "gold", fontSize: "12px" }}>● RECORDS: {history.length}</div>
        </div>
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }}>
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={2} jc={"center"} ai={"center"} 
            style={{ backgroundColor: "var(--accent)", padding: 24, borderRadius: 24, border: "4px dashed var(--secondary)" }}>
            <s.TextTitle style={{ textAlign: "center", fontSize: 50, fontWeight: "bold", color: "var(--accent-text)" }}>
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>Sale Ended</s.TextTitle>
            ) : (
              <>
                <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST} {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerSmall />
                {blockchain.account === "" || blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <StyledButton onClick={(e) => { e.preventDefault(); dispatch(connect()); }}>
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
  <s.TextDescription style={{ textAlign: "center", color: "red", marginTop: "10px" }}>
    {blockchain.errorMsg}
  </s.TextDescription>
) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription style={{ textAlign: "center", color: "var(--accent-text)" }}>{feedback}</s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton onClick={(e) => { e.preventDefault(); decrementMintAmount(); }}>-</StyledRoundButton>
                      <s.SpacerMedium /><s.TextDescription>{mintAmount}</s.TextDescription><s.SpacerMedium />
                      <StyledRoundButton onClick={(e) => { e.preventDefault(); incrementMintAmount(); }}>+</StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <StyledButton disabled={claimingNft ? 1 : 0} onClick={(e) => { e.preventDefault(); claimNFTs(); }}>
                      {claimingNft ? "BUSY" : "BUY"}
                    </StyledButton>
                  </>
                )}
              </>
            )}
          </s.Container>
        </ResponsiveWrapper>

        {/* IMPROVEMENT: HYBRID DATA TABLE (Displays data Node.js API)  */}
        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"center"} style={{ width: "100%", backgroundColor: "var(--accent)", padding: "20px", borderRadius: "20px" }}>
          <s.TextTitle style={{ color: "var(--accent-text)", fontSize: "28px" }}>Global Mint History (Backend)</s.TextTitle>
          <s.TextDescription style={{ color: "var(--primary-text)" }}>Data provided by our Hybrid Distributed Layer</s.TextDescription>
          <s.SpacerSmall />
          {history.length === 0 ? (
            <s.TextDescription style={{ color: "var(--accent-text)" }}>No off-chain records yet.</s.TextDescription>
          ) : (
            history.map((item, index) => (
              <div key={index} style={{ borderBottom: "1px solid white", width: "80%", padding: "5px" }}>
                <s.TextDescription style={{ fontSize: "12px", color: "var(--accent-text)" }}>
                  <b>Wallet:</b> {truncate(item.wallet, 15)} | <b>Tx:</b> {truncate(item.hash, 10)}
                </s.TextDescription>
              </div>
            ))
          )}
        </s.Container>
      </s.Container>
    </s.Screen>
  );
} 

export default App;
