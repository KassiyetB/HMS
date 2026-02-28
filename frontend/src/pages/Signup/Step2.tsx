import { useEffect, useState } from 'react'
import './Signup.css'

export default function Step2() {

    type CountryOption = {
        name:string,
        dialCode: string,
        flag: string,
    }

    const [countries, setCountries] = useState<CountryOption[]>([]);

    useEffect(() => {
        fetch('https://restcountries.com/v3.1/all?fields=name,idd,flags')
        .then(res=> res.json())
        .then((data: any[]) => {
            const formatted: CountryOption[] = data.map(country => ({
                name: country.name.common,
                dialCode: country.idd.root,
                flag: country.flags.png,
            })).sort((a, b) => a.name.localeCompare(b.name));
            setCountries(formatted);
            return formatted;
        })

        
    }, [])

    console.log(countries);

    return(
        <form className='Signup-form'>
            <h1>Sign up</h1>
            <p>Please confirm your country code and enter your phone number</p> 
            <div id="s-input-1" className="signup-input-phone">
                <hr />
                <select>
                    {countries.map((country: CountryOption) => (
                        <option>
                            <img className='country-flag' src={country?.flag}/>
                            <p className='country-name'>{country?.name}</p>
                        </option>
                ))}
                </select>
                <hr />
                <div>
                    <p className='country-code'>{countries[114]?.dialCode}</p>
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