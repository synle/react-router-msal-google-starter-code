import {
  AppBar,
  Avatar,
  Box,
  Button,
  CssBaseline,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ActionDialogsContext } from "react-dialog-mui";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import Loading from "~/components/Loading";
import { useMeProfile } from "~/utils/frontend/hooks/Auth";
import type { Route } from "./+types/root";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // notifyOnChangeProps: 'tracked',
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error?: any) => {
        // don't retry on these errors
        switch (error?.status) {
          case 400: // bad request
          case 401: // unauthorized - not authenticated
          case 403: // forbidden - not allowed
          case 404: // not found
            return false;
        }

        return true;
      },
    },
  },
});

export const links: Route.LinksFunction = () => [
  // put your font here if needed
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContextReducer(props: { children: ReactNode }) {
  const contexts = [ActionDialogsContext];
  const [init, setInit] = useState(false);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: prefersDarkMode ? "dark" : "light",
      },
    });
  }, [prefersDarkMode]);

  useEffect(() => {
    setInit(true);
  }, []);

  if (!init) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {contexts.reduceRight(
          (acc, ContextProvider) => (
            <ContextProvider>{acc}</ContextProvider>
          ),
          <>{props.children}</>,
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function MainRootWrapper() {
  const { data: profile, isLoading } = useMeProfile();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  let contentDom = <></>;

  const fullName = profile?.displayName;
  const initials = useMemo(() => {
    if (!fullName) {
      return "";
    }

    const names = fullName.split(" ");
    return names
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase();
  }, [fullName]);

  if (isLoading) {
    contentDom = <Loading>Loading...</Loading>;
  } else if (!profile) {
    contentDom = (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          sx={{
            px: 4,
            py: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6">Welcome back.</Typography>
          <Typography sx={{ marginBottom: 4 }}>
            You are not authenticated, please log in to continue.
          </Typography>
          <Box>
            <Button
              variant="contained"
              component={Link}
              href="/api/auth/login?mode=aad"
            >
              Log in with Microsoft
            </Button>
          </Box>
          <Box>
            <Button
              variant="contained"
              component={Link}
              href="/api/auth/login?mode=google"
            >
              Log in with Google
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  } else {
    contentDom = (
      <>
        <AppBar position="static">
          <Toolbar sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Link href="/" underline="hover">
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Sample App
                </Typography>
              </Link>
              {/* TODO: add more links / button if needed*/}
            </Box>
            <Box sx={{ marginLeft: "auto" }}>
              <IconButton
                aria-label="profile"
                aria-controls="current-user-profile-menu"
                aria-haspopup="true"
                onClick={(event) => setAnchorEl(event.currentTarget)}
              >
                <Avatar>{initials}</Avatar>
              </IconButton>
              <Menu
                id="current-user-profile-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem disabled>{fullName}</MenuItem>
                <MenuItem disabled>{profile.mail}</MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem component={Link} href="/api/auth/logout">
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Box sx={{ py: 2, px: 3 }}>
          <Outlet />
        </Box>
      </>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {contentDom}
    </Box>
  );
}

export default function App() {
  return (
    <>
      <CssBaseline />
      <AppContextReducer>
        <MainRootWrapper />
      </AppContextReducer>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
