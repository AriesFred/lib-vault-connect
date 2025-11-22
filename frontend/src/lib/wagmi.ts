import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Liib Vault',
  projectId: 'ef3325a718834a2b1b4134d3f520933d',
  chains: [sepolia, hardhat],
  ssr: false,
  locale: 'en',
});

