import { useEffect, useState } from 'react'
import './Signup.css'
import Select from 'react-select';

type CountryOption = {
        value: string; // The full phone code (e.g., +1)
        label: string; // The country name
        flag: string;  // The flag image URL
    }

export default function Step2() {

    const [countries, setCountries] = useState<CountryOption[]>([]);
    const [selected, setSelected] = useState<CountryOption | null>(null);

    useEffect(() => {
        fetch('https://restcountries.com/v3.1/all?fields=name,idd,flags')
        .then(res=> res.json())
        .then((data: any[]) => {
            const formatted: CountryOption[] = data.map(country => ({
                value: country.idd?.root,
                label: country.name.common,
                flag: country.flags.png,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
            setCountries(formatted);
            return formatted;
        });
    }, []);

    return(
        <form className='Signup-form'>
            <h1>Sign up</h1>
            <p>Please confirm your country code and enter your phone number</p> 
            <div id="s-input-1" className="signup-input-phone">
                <hr />
                <Select 
                    options={countries}
                    value={selected}
                    onChange={(option) => setSelected(option)}
                    formatOptionLabel={country => (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={country.flag} alt="" style={{ width: 20, marginRight: 10 }} />
                            <span>{country.label}</span>
                        </div>
                    )}

                />
                <hr />
                <div style={{display: "flex", gap:"15px", alignItems:"center"}}>
                    <p className='country-code'>{selected?.value}</p>
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