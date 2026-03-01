import './Signup.css'
import { useNavigate } from 'react-router-dom';
import { RadioButtonGroup, RadioButton } from "@/components/RadioButton"
import { useOutletContext } from "react-router-dom";
import type { UserObject } from "@/layouts/SignupLayout";

type ContextType = {
  userData: UserObject;
  setUserData: React.Dispatch<React.SetStateAction<UserObject>>;
};


export default function Step1() {
    const navigate = useNavigate();

    const {userData, setUserData} = useOutletContext<ContextType>();

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        navigate("/signup/step2");
    }

    return(
        <form className='Signup-form' onSubmit={handleSubmit}>
            <div className='signup-header'>
                <h1>Sign up</h1>
            </div>
            <div id="s-input-1" className="signup-input">
                <label htmlFor="first-name">First name</label>
                <br />
                <input 
                    id="first-name" 
                    type="text" 
                    placeholder="enter your first name" 
                    value={userData?.first_name} 
                    onChange={(e) => 
                        setUserData(prev => ({
                            ...prev,
                            first_name: e.target.value
                        }))
                    }
                    minLength={2}
                    required
                />
            </div>
            <div id="s-input-2" className="signup-input">
                <label htmlFor="last-name">Last name</label>
                <br />
                <input 
                    id="last-name" 
                    type="text" 
                    placeholder="enter your last name" 
                    value={userData?.last_name}
                    onChange={(e) => 
                        setUserData(prev => ({
                            ...prev,
                            last_name: e.target.value
                        }))
                    }
                    minLength={2}
                    required
                />
            </div>
            <div id="s-input-3" className="signup-input">
                <label htmlFor="date-of-birth">Date of birth</label>
                <br />
                <input 
                    id="date-of-birth" 
                    type="text" 
                    placeholder="17/08/2025" 
                    pattern='(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])/(19|20)\d\d' 
                    value={userData?.date_of_birth} 
                    onChange={(e) => 
                        setUserData(prev => ({
                            ...prev,
                            date_of_birth: e.target.value
                        }))
                    }
                    required
                />
            </div>
            <div id="s-input-4" className="signup-input">
                <label htmlFor="gender-radio">Gender</label>
                <br />
                <RadioButtonGroup 
                    name="gender" 
                    onChange={ value => 
                        setUserData(prev => ({...prev, gender:value}))}
                    required
                >
                    <RadioButton value="male" />
                    <RadioButton value="female"/>
                </RadioButtonGroup>
            </div>
            <div className='submit-btn-aligner'>
                <input type="submit" value="Continue" />
            </div>
        </form>
    )
}