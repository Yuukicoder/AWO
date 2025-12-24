import { PrivateRoutes } from "@/routes/privateRoutes";
import { Routes } from "react-router-dom";


const Layout =() => {
    return (
        <Routes>
            <PrivateRoutes />
        </Routes>
    )
};
export default Layout;