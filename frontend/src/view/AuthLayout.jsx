import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectIsAuthenticating } from "@/state/session_slice";
import ConnectModal from "@/components/ui/connect-modal";
import { useAgent } from "@nfid/identitykit/react";
import { initialize } from "@/state/session_slice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { fetchVaults } from "@/state/vaults_slice";
import { Box } from "@chakra-ui/react";
import Header from "@/components/ui/header";

export const AuthLayout = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAuthenticating = useSelector(selectIsAuthenticating);
    const authenticatedAgent = useAgent({
        host: import.meta.env.VITE_IC_HOST,
    });

    useEffect(() => {
        if (authenticatedAgent) {
            dispatch(initialize(authenticatedAgent)).then((result) => {
                if (!result.error) {
                    dispatch(fetchVaults());
                }
            });
        }
    }, [authenticatedAgent, dispatch]);

    if (!isAuthenticated && !isAuthenticating) {
        return <ConnectModal />;
    }

    return (
        <Box maxW="1100px" mx="auto" pt={8}>
            <Box p={4}>
                <Header />
                <Box mt={8}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};