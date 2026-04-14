import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, X, Eye, EyeOff, Sparkles } from "lucide-react";
import { registerUser } from "../../api/auth.api";
import { toastError, toastSuccess } from "../../utils/toast";

const Register = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-z0-9.-]+\.[a-z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const fullNameRegex = /^[A-Za-z ]{3,30}$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Full name is required";
    else if (!fullNameRegex.test(form.name)) err.name = "Invalid name format";

    if (!emailRegex.test(form.email)) err.email = "Invalid email address";

    if (!passwordRegex.test(form.password))
      err.password = "Must have 1 Cap, 1 Num, 1 Special (Min 8)";

    if (form.password !== form.confirmPassword) err.confirmPassword = "No match";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await registerUser(form);
      toastSuccess("Account created successfully");
      navigate("/login");
    } catch (err) {
      toastError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-indigo-200/40 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-72 h-72 bg-blue-200/40 rounded-full blur-[80px]"></div>
      </div>

      {/* COMPACT REGISTRATION CARD */}
      <div className="relative w-full max-w-md my-auto">
        <form
          onSubmit={handleSubmit}
          className="relative bg-white/90 backdrop-blur-xl w-full px-6 py-8 md:px-10 rounded-4xl border border-slate-100 shadow-2xl"
        >
          {/* CLOSE */}
          <Link to="/" className="absolute right-5 top-5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
            <X size={18} />
          </Link>

          {/* HEADER (Reduced Margins) */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg mb-3">
              <Sparkles size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Join Us</h2>
            <p className="text-slate-500 text-xs font-medium">Start your internship journey today</p>
          </div>

          <div className="space-y-4">
            {/* NAME */}
            <div>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>
              {errors.name && <p className="text-red-500 font-bold text-[10px] mt-1 ml-2">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>
              {errors.email && <p className="text-red-500 font-bold text-[10px] mt-1 ml-2">{errors.email}</p>}
            </div>

            {/* PASSWORD GRID (Side by side to save height) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={14} />
                <input
                  type={show ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-none transition-all"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={14} />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm"
                  onChange={handleChange}
                  className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* PASSWORD ERRORS (Small & Condensed) */}
            {(errors.password || errors.confirmPassword) && (
              <p className="text-red-500 font-bold text-[9px] px-2 leading-tight">
                {errors.password || errors.confirmPassword}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95 cursor-pointer disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <p className="text-slate-500 text-center mt-6 text-xs font-medium">
            Already a member?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline cursor-pointer">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;