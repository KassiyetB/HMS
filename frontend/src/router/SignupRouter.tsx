import { Route, Routes } from 'react-router-dom';
import SignupLayout from '@/layouts/SignupLayout';
import Step1 from '@/pages/Signup/Step1';
import Step2 from '@/pages/Signup/Step2';
import Step3 from '@/pages/Signup/Step3';

export default function SignupRouter() {
    return (
        <Routes>
            <Route path='/' element={<SignupLayout />}>
                <Route path='step1' element={<Step1 />} />
                <Route path='step2' element={<Step2 />} />
                <Route path='step3' element={<Step3 />} />
            </Route>
        </Routes>
    )
}