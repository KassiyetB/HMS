import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Home from "@/pages/Home";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login/>} />

                {/* Protected Layout Routes */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}