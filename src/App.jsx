import React, { useState, useEffect } from "react";
import axios from "axios";

function getQueryParams() {
  const params = {};
  const search = window.location.search;
  if (search) {
    new URLSearchParams(search).forEach((value, key) => {
      params[key] = value;
    });
  }
  return params;
}

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await axios.post(
        "/auth/login",
        {
          email: username,
          password,
        },
        { withCredentials: true }
      );
      if (res.data?.data?.url) {
        window.location.href = res.data.data.url;
      } else {
        setErr("Login failed (no duo_url returned)");
      }
    } catch (error) {
      setErr(error.response?.data?.msg || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Smartzi"
          src="/smartzi.png"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          {err && (
            <div className="text-red-600 text-center">{err}</div>
          )}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VerifyResult() {
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const params = getQueryParams();
    if (!params.state || !params.duo_code) {
      setErr("Missing state or duo_code in URL");
      return;
    }
    axios
      .get("/verify", {
        params: {
          state: params.state,
          duo_code: params.duo_code,
        },
        withCredentials: true,
      })
      .then((res) => setResult(res.data))
      .catch((error) => setErr(error.response?.data || "Verification failed"));
  }, []);

  if (err)
    return (
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="p-6 rounded bg-red-100 text-center text-red-700">
            {err}
          </div>
        </div>
      </div>
    );
  if (!result)
    return (
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="p-6 rounded bg-gray-100 text-center">
            Checking...
          </div>
        </div>
      </div>
    );
  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="p-6 rounded bg-green-100 text-center">
          <div className="font-bold text-green-800 mb-2">2FA Complete!</div>
          <pre className="overflow-x-auto text-left whitespace-pre-wrap break-all text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function App() {
  const params = getQueryParams();
  const isVerify = params.state && params.duo_code;

  return (
    <>
      {!isVerify ? <LoginForm /> : <VerifyResult />}
    </>
  );
}

export default App;