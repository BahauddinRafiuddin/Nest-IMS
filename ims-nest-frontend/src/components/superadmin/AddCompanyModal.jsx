import { useState } from "react";
import {
  X,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Percent,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { toastError, toastSuccess } from "../../utils/toast";
import { createCompany } from "../../api/superAdmin.api";

const AddCompanyModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    commissionPercentage: 20,
    adminEmail: "",
    adminName: "",
  });

  const [errors, setErrors] = useState({});

  const emailRegex =
    /^[a-zA-Z][a-zA-Z0-9._%+-]{2,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "commissionPercentage" ? Number(value) : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (!form.name.trim()) newErrors.name = "Company name is required";
    if (form.email && !emailRegex.test(form.email))
      newErrors.email = "Invalid company email format";
    if (form.phone && !phoneRegex.test(form.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (
      form.commissionPercentage === "" ||
      form.commissionPercentage <= 0 ||
      form.commissionPercentage > 100
    ) {
      newErrors.commissionPercentage = "Commission must be between 0 and 100";
    }
    if (!form.adminName.trim()) newErrors.adminName = "Admin name is required";
    if (!emailRegex.test(form.adminEmail))
      newErrors.adminEmail = "Invalid admin email address";
    if (
      form.commissionPercentage === "" ||
      form.commissionPercentage <= 0 ||
      form.commissionPercentage > 90 // Changed from 100 to 90
    ) {
      newErrors.commissionPercentage = "Commission must be between 1 and 90";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await createCompany(form);
      toastSuccess("Company and Admin created successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || "Failed to create company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative border border-white/20 custom-scrollbar">
        {/* HEADER SECTION */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-lg z-10 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
              <Plus size={22} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Onboard Company
              </h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                Registration Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* SECTION 1: COMPANY DATA */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Building size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">
                Business Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Company Name *"
                name="name"
                icon={<Building size={16} />}
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Global Tech Solutions"
              />
              <InputField
                label="Company Email"
                name="email"
                type="email"
                icon={<Mail size={16} />}
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="contact@company.com"
              />
              <InputField
                label="Phone Number"
                name="phone"
                icon={<Phone size={16} />}
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                maxLength={10}
                placeholder="9876543210"
              />
              <InputField
                label="Business Address"
                name="address"
                icon={<MapPin size={16} />}
                value={form.address}
                onChange={handleChange}
                placeholder="Silicon Valley, CA"
              />
            </div>

            {/* COMMISSION SLIDER-STYLE INPUT */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Percent size={16} className="text-indigo-600" /> Platform
                  Commission (%) *
                </label>
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-black rounded-lg shadow-md shadow-indigo-100">
                  {form.commissionPercentage}%
                </span>
              </div>
              <input
                name="commissionPercentage"
                type="range"
                min="1"
                max="90"
                value={form.commissionPercentage}
                onChange={handleChange}
                className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400 font-medium mt-3 leading-relaxed">
                <ShieldCheck size={12} className="inline mr-1" />
                Super Admin will retain this percentage from every successful
                enrollment processed by this company.
              </p>
              {errors.commissionPercentage && (
                <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1">
                  {errors.commissionPercentage}
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: ADMIN DATA */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <User size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">
                Administrative Lead
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Admin Full Name *"
                name="adminName"
                icon={<User size={16} />}
                value={form.adminName}
                onChange={handleChange}
                error={errors.adminName}
                placeholder="John Doe"
              />
              <InputField
                label="Admin Work Email *"
                name="adminEmail"
                type="email"
                icon={<Mail size={16} />}
                value={form.adminEmail}
                onChange={handleChange}
                error={errors.adminEmail}
                placeholder="admin@company.com"
              />
            </div>
          </div>

          {/* FOOTER ACTION */}
          <div className="pt-4 sticky bottom-0 bg-white/50 backdrop-blur-sm pb-2">
            <button
              disabled={loading}
              className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Onboarding...</span>
                </div>
              ) : (
                <>
                  <span>Create Company & Admin</span>
                  <Plus
                    size={20}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Input Component for consistency
const InputField = ({ label, icon, error, ...props }) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-medium outline-none transition-all
          ${
            error
              ? "border-rose-300 focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500"
              : "border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white hover:border-slate-300"
          }`}
      />
    </div>
    {error && (
      <p className="text-rose-500 text-[10px] font-bold mt-1 ml-2">{error}</p>
    )}
  </div>
);

export default AddCompanyModal;
