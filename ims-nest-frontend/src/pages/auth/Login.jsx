import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { loginUser } from "../../api/auth.api";
import { Eye, EyeOff, X, Mail, Lock, Sparkles } from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex =
    /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let err = {};
    if (!emailRegex.test(form.email)) {
      err.email = "Please enter a valid email address";
    }
    if (!form.password) {
      err.password = "Password is required";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const data = await loginUser(form);
      console.log("role",data.user.role)
      login(data);


      toastSuccess("Login successful");
      if (data.user.forcePasswordChange) {
        navigate("/change-password");
        return;
      }

      const role = data.user?.role || data.role;
      console.log(role)
      if (role === "SUPER_ADMIN") navigate("/superadmin");
      else if (role === "ADMIN") navigate("/admin");
      else if (role === "MENTOR") navigate("/mentor");
      else if(role === "PUBLIC_USER") navigate("/public_user", { replace: true })
      else navigate("/intern");
    } catch (err) {
      toastError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 overflow-hidden font-sans">
      {/* --- BACKGROUND DECORATION (Matches Register/Landing) --- */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-indigo-200/40 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full blur-[80px]"></div>
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative w-full max-w-md my-auto">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-blue-600 rounded-4xl blur opacity-10"></div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-white/90 backdrop-blur-xl w-full px-8 py-10 rounded-4xl border border-white shadow-2xl"
        >
          {/* Close Button */}
          <Link
            to="/"
            className="absolute right-6 top-6 text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-full cursor-pointer"
          >
            <X size={18} />
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 mb-4">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="space-y-5">
            {/* EMAIL */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-700 ml-1 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all
                    ${errors.email 
                      ? "border-red-300 focus:ring-4 focus:ring-red-500/5 focus:border-red-500" 
                      : "border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white hover:border-slate-300"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 font-bold text-[10px] mt-1 ml-2">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-700 ml-1 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  size={18}
                />
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-xl text-sm font-medium outline-none transition-all
                    ${errors.password 
                      ? "border-red-300 focus:ring-4 focus:ring-red-500/5 focus:border-red-500" 
                      : "border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white hover:border-slate-300"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 font-bold text-[10px] mt-1 ml-2">{errors.password}</p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-base shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          <p className="text-slate-500 text-center mt-8 text-sm font-medium">
            Don’t have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4 cursor-pointer transition-all">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;