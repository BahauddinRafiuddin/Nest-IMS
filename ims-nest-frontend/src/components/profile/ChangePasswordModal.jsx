import { useState } from "react";
import { X, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { changePassword } from "../../api/user.api";
import { toastError, toastSuccess } from "../../utils/toast";

const ChangePasswordModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let err = {};

    if (!form.currentPassword) {
      err.currentPassword = "Current password required";
    }

    if (!form.newPassword) {
      err.newPassword = "New password required";
    } else if (!passwordRegex.test(form.newPassword)) {
      err.newPassword =
        "Min 8 chars, 1 capital, 1 number, 1 symbol";
    }

    if (!form.confirmPassword) {
      err.confirmPassword = "Confirm your password";
    } else if (form.confirmPassword !== form.newPassword) {
      err.confirmPassword = "Passwords do not match";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double click
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await changePassword(form);
      toastSuccess(res.message);
      onClose();
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">

        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <InputField
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            show={show}
            toggle={() => setShow(!show)}
            error={errors.currentPassword}
          />

          <InputField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            show={show}
            toggle={() => setShow(!show)}
            error={errors.newPassword}
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            show={show}
            toggle={() => setShow(!show)}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  show,
  toggle,
  error,
}) => (
  <div>
    <label className="text-sm font-medium">{label}</label>

    <div className="relative mt-1">
      <Lock className="absolute left-3 top-3 text-gray-400" size={16} />

      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        maxLength={8}
        onChange={onChange}
        disabled={false}
        className="w-full pl-9 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 text-gray-500 cursor-pointer"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>

    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
);

export default ChangePasswordModal;