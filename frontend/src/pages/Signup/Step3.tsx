import './Signup.css'

export default function Step3() {
    return(
        <form className='Signup-form'>
            <h1>Enter code</h1>
            <p>We've sent an SMS with an activation code to your phone <strong>+7 000 000 00 00</strong></p> 
            <form className="otp-container">
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
            </form>
            <p className='gray-text'>Send code again after <span>00:20</span></p>
        </form>
    )
}