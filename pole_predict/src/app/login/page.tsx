"use client"

import React, { useState } from 'react';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaToken, setTwoFaToken] = useState('');
  const [isTwoFaRequired, setIsTwoFaRequired] = useState(false);
  const [twoFaSecret, setTwoFaSecret] = useState('');

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Step 1: Login and retrieve 2FA secret
    const res = await fetch('http://localhost:8000/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setTwoFaSecret(data.two_fa_secret);
      setIsTwoFaRequired(true);
    } else {
      alert('Login failed');
    }
  };

  const handleVerify2FA = async (e: { preventDefault: () => void;}) => {
    e.preventDefault();

    // Step 2: Verify 2FA token
    const res = await fetch('http://localhost:8000/verify-2fa/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, token: twoFaToken }),
    });

    if (res.ok) {
      alert('2FA verification successful');
      // Redirect or perform further actions
    } else {
      alert('Invalid 2FA token');
    }
  };

  return (
    <div>
      {!isTwoFaRequired ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <form onSubmit={handleVerify2FA}>
          <input
            type="text"
            placeholder="2FA Token"
            value={twoFaToken}
            onChange={(e) => setTwoFaToken(e.target.value)}
            required
          />
          <button type="submit">Verify 2FA</button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
