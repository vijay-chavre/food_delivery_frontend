import { StoryObj, Meta } from "@storybook/react";
import SupplierCreate from "../LedgerDropdown/SupplierCreate";
import { AccountProvider } from "@/context/accountProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { StyledEngineProvider } from "@mui/material";
import ThemeProviderWrapper from "@/components/theme/ThemeProvider";

const meta = {
  component: SupplierCreate,
  decorators: [
    (Story) => (
      <AccountProvider>
        <AppRouterCacheProvider>
          <StyledEngineProvider injectFirst>
            <ThemeProviderWrapper>
              <Story />
            </ThemeProviderWrapper>
          </StyledEngineProvider>
        </AppRouterCacheProvider>
      </AccountProvider>
    ),
  ],
} satisfies Meta<typeof SupplierCreate>;

export default meta;

export const Default: StoryObj = {
  args: {},
};

// export const WithInitialValues: StoryObj = {
//   args: {
//     productId: "66a4dc890703d95b011e62f4",
//     onSubmit: () => {},
//   },
// };
