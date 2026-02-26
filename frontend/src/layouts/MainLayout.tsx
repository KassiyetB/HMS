import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <>
            <h1>Hospital Management System</h1>
            <hr />
            <Outlet />
            
        </>
    )
}