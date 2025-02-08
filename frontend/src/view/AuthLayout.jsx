import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectIsAuthenticating } from "@/state/session_slice";
import ConnectModal from "@/components/ui/connect-modal";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import { initialize } from "@/state/session_slice";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { fetchVaults } from "@/state/vaults_slice";
import { Box } from "@chakra-ui/react";
import Header from "@/components/ui/header";
import { Toaster } from "@/components/ui/toaster";

export const AuthLayout = () => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAuthenticating = useSelector(selectIsAuthenticating);
    const authenticatedAgent = useAgent({
        host: import.meta.env.VITE_IC_HOST,
    });
    const { disconnect } = useAuth();

    useEffect(() => {
        if (authenticatedAgent) {
            dispatch(initialize(authenticatedAgent)).then((result) => {
                if (result.error) {
                    // If initialization fails, disconnect from NFID
                    disconnect();
                } else {
                    dispatch(fetchVaults());
                }
            });
        }
    }, [authenticatedAgent, dispatch, disconnect]);

    if (!isAuthenticated && !isAuthenticating) {
        return (
            <>
                <Toaster />
                <ConnectModal />
            </>
        );
    }

    return (
        <>
            <Toaster />
            <Box maxW="1100px" mx="auto" pt={8}>
                <Box p={4}>
                    <Header />
                    <Box mt={8}>
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </>
    );
};