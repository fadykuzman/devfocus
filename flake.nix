{
  inputs = {
    nixpkgs.url = "github:cachix/devenv-nixpkgs/rolling";
    systems.url = "github:nix-systems/default";
    devenv.url = "github:cachix/devenv";
    devenv.inputs.nixpkgs.follows = "nixpkgs";
  };

  nixConfig = {
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = {
    self,
    nixpkgs,
    devenv,
    systems,
    ...
  } @ inputs: let
    forEachSystem = nixpkgs.lib.genAttrs (import systems);
  in {
    devShells =
      forEachSystem
      (system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        default = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = [
            {
              packages = with pkgs; [
                nodejs
                pkgs.nodePackages.tailwindcss
                pkgs.nodePackages.prettier
                pkgs.nodePackages.postcss
                pkgs.nodePackages.autoprefixer
                pkgs.nodePackages.eslint
                pkgs.playwright-driver.browsers
                pkgs.gh
                pkgs.gh-notify
              ];
              # env.PNPM_VERSION = yarnVersion;
              env.PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
              env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
              env.PLAYWRIGHT_NODEJS_PATH = "${pkgs.nodejs}/bin/node";
              env.PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH = "${pkgs.playwright-driver.browsers}/chromium-1048/chrome-linux/chrome";
              env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 1;

              languages = {
                typescript.enable = true;
                javascript = {
                  enable = true;
                  pnpm = {
                    enable = true;
                    install.enable = true;
                  };
                };
              };

            }
          ];
        };
      });
  };
}
