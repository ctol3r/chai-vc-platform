type WalletFlowProps = {
  params?: {
    flow?: string;
  };
};

export default function WalletFlow({ params }: WalletFlowProps) {
  const flow = params?.flow ?? 'unknown';
  return <div>Wallet: {flow}</div>;
}
