import './Signup.css'
import { RadioButtonGroup, RadioButton } from "@/components/RadioButton"

export default function Step1() {
    return(
        <form className='Signup-form'>
            <div className='signup-header'>
                <h1>Sign up</h1>
            </div>
            <div id="s-input-1" className="signup-input">
                <label htmlFor="first-name">First name</label>
                <br />
                <input id="first-name" type="text" placeholder="enter your first name" />
            </div>
            <div id="s-input-2" className="signup-input">
                <label htmlFor="last-name">Last name</label>
                <br />
                <input id="last-name" type="text" placeholder="enter your last name" />
            </div>
            <div id="s-input-3" className="signup-input">
                <label htmlFor="date-of-birth">Date of birth</label>
                <br />
                <input id="date-of-birth" type="text" placeholder="17/08/2025"></input>
            </div>
            <div id="s-input-4" className="signup-input">
                <label htmlFor="gender-radio">Gender</label>
                <br />
                <RadioButtonGroup name="gender">
                    <RadioButton value="male" />
                    <RadioButton value="female"/>
                </RadioButtonGroup>
            </div>
            <div className='submit-btn-aligner'>
                <input type="submit" value="Continue"></input>
            </div>
        </form>
    )
}