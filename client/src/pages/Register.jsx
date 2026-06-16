import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register({ onLogin }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const [verifyToken,  setVerifyToken]  = useState(null);
  const [successMsg,   setSuccessMsg]   = useState('');
  const [verifying,    setVerifying]    = useState(false);
  const [verified,     setVerified]     = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(name, email, password);
      onLogin(data.token);
      setVerifyToken(data.verifyToken);
      setSuccessMsg(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

    async function handleVerifyClick() {
    setVerifying(true);
    try {
      await api.verifyEmail(verifyToken);
      setVerified(true);
      setSuccessMsg('Email verified! Your account is now active.');
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setSuccessMsg('Verification failed. Try clicking the link in your email instead.');
    } finally {
      setVerifying(false);
    }
  }
    if (verifyToken) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                      justifyContent: 'center', padding: '48px 64px', background: '#fff' }}>

          <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: 4,
                        color: '#1a73e8', marginBottom: 48 }}>THE APP</div>

          <div className="alert alert-success py-3 mb-4">
            <i className="bi bi-envelope-check me-2" />
            {successMsg}
          </div>

          {!verified && 
          (
            <>
              <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                Check your inbox and click the link, or use the button below:
              </p>
              <button
                className="btn btn-primary py-2 fw-semibold w-100"
                style={{ borderRadius: 6 }}
                onClick={handleVerifyClick}
                disabled={verifying}
              >
                {verifying
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <i className="bi bi-envelope-check me-2" />}
                Click here to verify your email
              </button>

              <div className="mt-3 text-center">
                <button
                  className="btn btn-link text-muted p-0"
                  style={{ fontSize: 13 }}
                  onClick={() => navigate('/')}
                >
                  Skip for now →
                </button>
              </div>
            </>
          )}

          {verified && (
            <div className="text-center text-muted" style={{ fontSize: 14 }}>
              <span className="spinner-border spinner-border-sm me-2" />
              Redirecting…
            </div>
          )}
        </div>

       
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1a1a6e 0%, #1565c0 25%, #42a5f5 50%, #1565c0 75%, #0d47a1 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}
            viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
            {[
              ['#1976d2','M0,0 L200,80 L150,200 Z'],
              ['#1565c0','M200,80 L400,0 L350,180 Z'],
              ['#0d47a1','M400,0 L600,100 L500,200 Z'],
              ['#42a5f5','M150,200 L350,180 L300,350 Z'],
              ['#1e88e5','M350,180 L500,200 L450,380 Z'],
              ['#1976d2','M0,200 L150,200 L100,380 Z'],
              ['#0d47a1','M300,350 L450,380 L400,520 Z'],
              ['#1565c0','M100,380 L300,350 L200,500 Z'],
              ['#42a5f5','M450,380 L600,300 L600,500 Z'],
              ['#1976d2','M200,500 L400,520 L350,680 Z'],
              ['#0d47a1','M0,380 L100,380 L50,560 Z'],
              ['#1e88e5','M400,520 L600,500 L550,680 Z'],
              ['#1565c0','M50,560 L200,500 L150,700 Z'],
              ['#42a5f5','M350,680 L550,680 L500,800 Z'],
              ['#1976d2','M150,700 L350,680 L250,800 Z'],
              ['#0d47a1','M0,560 L50,560 L0,700 Z'],
              ['#1e88e5','M500,200 L600,100 L600,300 Z'],
              ['#1565c0','M0,700 L150,700 L100,800 Z'],
              ['#42a5f5','M550,680 L600,500 L600,800 Z'],
            ].map(([fill, d], i) => (
              <path key={i} d={d} fill={fill} opacity="0.85" />
            ))}
          </svg>
        </div>
      </div>
    );
  }

  return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
                      justifyContent: 'center', padding: '48px 64px', background: '#fff' }}>

          <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: 4,
                        color: '#1a73e8', marginBottom: 48 }}>
            THE APP
          </div>

          <p style={{ color: '#888', marginBottom: 4, fontSize: 14 }}>Join us today</p>
          <h2 style={{ fontWeight: 700, marginBottom: 32, fontSize: 26 }}>Create Your Account</h2>

          {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label text-muted" style={{ fontSize: 13 }}>Full Name</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Jane Smith" required
                  value={name} onChange={e => setName(e.target.value)} autoFocus />
                 <span className="input-group-text bg-white">
                    <i className="bi bi-person text-muted" />
                 </span> 
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted" style={{ fontSize: 13 }}>Email address</label>
              <div className="input-group">
                <input type="email" className="form-control" placeholder="you@example.com" required
                value={email} onChange={e => setEmail(e.target.value)} />
                <span className="input-group-text bg-white">
                  <i className="bi bi-envelope text-muted" />
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label text-muted" style={{ fontSize: 13 }}>Password</label>
              <div className="input-group">
                <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="Any non-empty password" required
                  value={password} onChange={e => setPassword(e.target.value)} />
                <span className="input-group-text bg-white" style={{ cursor: 'pointer' }}
                  onClick={() => setShowPass(v => !v)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
                </span>
              </div>
            </div>
              
            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" style={{ borderRadius: 6 }} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              Create Account
            </button>
          </form>

          <div className="mt-4" style={{ fontSize: 14 }}>
            <span className="text-muted">Already have an account?{' '}
              <Link to="/login" className="text-primary">Sign in</Link>
            </span>
          </div>
        </div>

        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1a1a6e 0%, #1565c0 25%, #42a5f5 50%, #1565c0 75%, #0d47a1 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}
            viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
            {[
              ['#1976d2','M0,0 L200,80 L150,200 Z'],
              ['#1565c0','M200,80 L400,0 L350,180 Z'],
              ['#0d47a1','M400,0 L600,100 L500,200 Z'],
              ['#42a5f5','M150,200 L350,180 L300,350 Z'],
              ['#1e88e5','M350,180 L500,200 L450,380 Z'],
              ['#1976d2','M0,200 L150,200 L100,380 Z'],
              ['#0d47a1','M300,350 L450,380 L400,520 Z'],
              ['#1565c0','M100,380 L300,350 L200,500 Z'],
              ['#42a5f5','M450,380 L600,300 L600,500 Z'],
              ['#1976d2','M200,500 L400,520 L350,680 Z'],
              ['#0d47a1','M0,380 L100,380 L50,560 Z'],
              ['#1e88e5','M400,520 L600,500 L550,680 Z'],
              ['#1565c0','M50,560 L200,500 L150,700 Z'],
              ['#42a5f5','M350,680 L550,680 L500,800 Z'],
              ['#1976d2','M150,700 L350,680 L250,800 Z'],
              ['#0d47a1','M0,560 L50,560 L0,700 Z'],
              ['#1e88e5','M500,200 L600,100 L600,300 Z'],
              ['#1565c0','M0,700 L150,700 L100,800 Z'],
              ['#42a5f5','M550,680 L600,500 L600,800 Z'],
            ].map(([fill, d], i) => (
              <path key={i} d={d} fill={fill} opacity="0.85" />
            ))}
          </svg>
        </div>
      </div>
      


  );
}
