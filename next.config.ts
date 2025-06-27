import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    // Handle worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      type: 'asset/resource',
    });

    // Exclude Miden SDK from server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@demox-labs/miden-sdk');
    }

    return config;
  },
};

export default nextConfig;
