import './Signup.css'

export default function Step2() {
    return(
        <form className='Signup-form'>
            <h1>Sign up</h1>
            <p>Please confirm your country code and enter your phone number</p> 
            <div id="s-input-1" className="signup-input-phone">
                <hr />
                <div>
                    <div className='country-flag'></div>
                    <p className='country-name'>Kazakhstan</p>
                </div>
                <hr />
                <div>
                    <p className='country-code'>+7</p>
                    <div className='vertical-line'></div>
                    <input type='text' className='phone-number' inputMode='numeric' pattern='[0-9]{3} [0-9]{3} [0-9]{2} [0-9]{2}' placeholder='000 000 00 00'></input>
                </div>
                <hr />
            </div>
            <div id="s-input-2" className="signup-input">
                <label htmlFor="password">Password</label>
                <br />
                <input id="password" type="password" placeholder="must be 8 characters" />
            </div>
            <div id="s-input-3" className="signup-input">
                <label htmlFor="repeat-password">Confirm password</label>
                <br />
                <input id="repeat-password" type="password" placeholder="repeat password" />
            </div>
            <div className='submit-btn-aligner'>
                <input type="submit" value="Continue"></input>
            </div>
        </form>
    )
}