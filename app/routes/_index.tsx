import { Box, Button } from "@mui/material";
import { useActionDialogs } from "react-dialog-mui";
import { useMeProfile } from "~/utils/frontend/hooks/Auth";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function () {
  const { data: profile, isLoading } = useMeProfile();
  const { modal } = useActionDialogs();

  return (
    <Box>
      <Box sx={{ width: "1000px", margin: "2rem 1rem" }}>
        <h1>Welcome to the Linkedin Node VM React Router template</h1>
        <h2>
          {new Date().toLocaleString()} - {Date.now()}
        </h2>
        {isLoading ? (
          <h3>Loading...</h3>
        ) : (
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        )}
      </Box>
      <Box>
        <Button
          variant="outlined"
          onClick={async () => {
            // more info here: https://github.com/synle/react-dialog-mui
            try {
              await modal({
                title: "Test Dialog",
                message: (
                  <>
                    <div>
                      <strong>Name:</strong> Mocked Name
                    </div>
                  </>
                ),
              });

              // when users close out of modal
            } catch (err) {}
          }}
        >
          Test
        </Button>
      </Box>
    </Box>
  );
}
