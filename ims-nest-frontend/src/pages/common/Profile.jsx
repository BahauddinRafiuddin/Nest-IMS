/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { getMyProfile } from "../../api/user.api";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal";
import { User, Mail, Building2, Phone, MapPin, Shield, KeyRound, Briefcase } from "lucide-react";
import { toastError } from "../../utils/toast";
import Loading from "../../components/common/Loading";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      setProfile(res.profile);
    } catch (err) {
      toastError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Loading/>
    );
  }

  if (!profile) {
    return (
    <p>Faild To Fetch Profile</p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your professional identity and security credentials.</p>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <KeyRound size={18} />
          Change Password
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: AVATAR & QUICK INFO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-24 h-24 bg-linear-to-tr from-indigo-600 to-violet-500 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
            <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider mt-1">{profile.role}</p>
            
            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col gap-3 text-left">
               <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={18} className="text-slate-400" />
                  <span className="text-sm truncate">{profile.email}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600">
                  <Shield size={18} className="text-slate-400" />
                  <span className="text-sm capitalize">{profile.role} Access</span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED INFO */}
        <div className="lg:col-span-2 space-y-6">
          {/* PERSONAL INFORMATION */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
              <User size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">Personal Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <ProfileItem label="Full Legal Name" value={profile.name} />
              <ProfileItem label="Primary Email" value={profile.email} />
            </div>
          </section>

          {/* COMPANY INFORMATION */}
          {profile.company && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-800">Employment Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ProfileItem icon={Building2} label="Company Name" value={profile.company.name} />
                <ProfileItem icon={Phone} label="Contact Number" value={profile.company.phone} />
                <div className="md:col-span-2">
                  <ProfileItem icon={MapPin} label="Work Location" value={profile.company.address} />
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
};

const ProfileItem = ({ icon: Icon, label, value }) => (
  <div className="group">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">
      {label}
    </p>
    <div className="flex items-start gap-2">
      {Icon && <Icon size={18} className="text-slate-300 mt-0.5" />}
      <p className="font-semibold text-slate-700 wrap-break-word text-base">
        {value || "Not Specified"}
      </p>
    </div>
  </div>
);

export default Profile;