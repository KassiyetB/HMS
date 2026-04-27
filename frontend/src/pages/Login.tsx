import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email және құпия сөзді енгізіңіз')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Кіру сәтсіз аяқталды')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'var(--accent)22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 1rem',
            border: '1px solid var(--accent)33',
          }}>⚕️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>МедиКер</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Медициналық орталық — жүйеге кіру</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--red)11',
                border: '1px solid var(--red)44',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--red)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@medicare.kz"
                autoComplete="email"
                disabled={loading}
                style={{ background: 'var(--bg)', fontSize: 14 }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Құпия сөз
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ background: 'var(--bg)', fontSize: 14, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--muted)', fontSize: 16, padding: '2px 4px',
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: 14,
                fontWeight: 600,
                marginTop: 4,
                opacity: loading ? 0.7 : 1,
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid #000',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                  }} />
                  Кіруде…
                </span>
              ) : 'Жүйеге кіру'}
            </button>
          </form>
        </div>

        {/* Demo accounts hint */}
        <div style={{
          marginTop: '1.5rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Тест аккаунттары
          </div>
          {[
            ['Әкімші',      'admin@medicare.kz',      'Admin123!'],
            ['Дәрігер',     'a.bekova@medicare.kz',   'Doctor123!'],
            ['Мейіргер',    'a.seitkali@medicare.kz', 'Nurse123!'],
            ['Зертханашы',  'b.djak@medicare.kz',     'Lab123!'],
            ['Регистратор', 'reception@medicare.kz',  'Recept123!'],
            ['Фармацевт',   'pharmacy@medicare.kz',   'Pharma123!'],
          ].map(([role, em, pw]) => (
            <button
              key={em}
              type="button"
              onClick={() => { setEmail(em); setPassword(pw); setError('') }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', background: 'none', border: 'none',
                borderRadius: 6, padding: '5px 6px', cursor: 'pointer',
                marginBottom: 2, transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)0d')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', minWidth: 90, textAlign: 'left' }}>{role}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{em}</span>
            </button>
          ))}
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
            ☝ Жолды басыңыз — автоматты толтырылады
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
