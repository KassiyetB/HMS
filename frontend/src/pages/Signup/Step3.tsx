import './Signup.css'

export default function Step3() {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("OTP submitted");
    };

    return(
        <form className='Signup-form' onSubmit={handleSubmit}>
            <h1>Enter code</h1>
            <p>
                We've sent an SMS with an activation code to your phone 
                <strong> +7 000 000 00 00</strong>
            </p> 

            <div className="otp-container">
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
                <input type="text" maxLength={1} className='otp-input' inputMode='numeric' pattern='[0-9]'/>
            </div>

            <p className='gray-text'>
                Send code again after <span>00:20</span>
            </p>

            <div className='submit-btn-aligner'>
                <input type="submit" value="Verify" />
            </div>
        </form>
    )
}