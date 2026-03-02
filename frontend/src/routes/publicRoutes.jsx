import RegisterForm from "@/pages/Auth/Register";


export const PrivateRoutes = (
    <>
    <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginUserForm />} />
        <Route path="/register" element={<RegisterForm />} /> 
    </Route>
    </>
) ;