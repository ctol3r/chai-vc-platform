import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const AUTH = gql`mutation($account:String!){authorizeIssuer(account:$account)}`;
const DEAUTH = gql`mutation($account:String!){deauthorizeIssuer(account:$account)}`;

export default function TrustRegistryAdmin() {
  const [account, setAccount] = useState("");
  const [authorize] = useMutation(AUTH);
  const [deauthorize] = useMutation(DEAUTH);
  return (
    <div style={{padding:24}}>
      <h2>Trust Registry Admin</h2>
      <input
        value={account}
        onChange={e=>setAccount(e.target.value)}
        placeholder="Account (SS58 or raw)"
        style={{width:360, padding:8}}
      />
      <div style={{marginTop:12}}>
        <button onClick={()=>authorize({variables:{account}})}>Authorize</button>
        <button onClick={()=>deauthorize({variables:{account}})} style={{marginLeft:8}}>Deauthorize</button>
      </div>
    </div>
  );
}
