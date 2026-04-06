module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const { oneOf } = webpackConfig.module.rules.find((r) => r.oneOf) || {};
      if (!oneOf) {
        return webpackConfig;
      }
      oneOf.forEach((rule) => {
        if (!rule.use) {
          return;
        }
        const uses = Array.isArray(rule.use) ? rule.use : [rule.use];
        uses.forEach((use) => {
          if (
            use &&
            typeof use === "object" &&
            use.loader &&
            String(use.loader).includes("sass-loader")
          ) {
            use.options = {
              ...use.options,
              sassOptions: {
                ...(use.options && use.options.sassOptions),
                silenceDeprecations: ["legacy-js-api"],
              },
            };
          }
        });
      });
      return webpackConfig;
    },
  },
};
