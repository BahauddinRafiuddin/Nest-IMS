/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { 
  Plus, 
  Pencil, 
  History, 
  Building2, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart3, 
  MoreVertical,
  SearchX
} from "lucide-react";
import AddCompanyModal from "../../components/superadmin/AddCompanyModal";
import { toastError, toastSuccess } from "../../utils/toast";
import { getAllcompanies, toggleCompanyStatus } from "../../api/superAdmin.api";
import ConfirmModal from "../../components/common/ConfirmModal";
import CompanyRevenueModal from "../../components/superadmin/CompanyRevenueModal";
import EditCommissionModal from "../../components/superadmin/EditCommissionModal";
import CompanyCommissionHistoryModal from "../../components/superadmin/CompanyCommissionHistoryModal";
import Loading from "../../components/common/Loading";

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [toggleStatus, setToggleStatus] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editCompany, setEditCompany] = useState(null);
  const [commissionCompany, setCommissionCompany] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllcompanies();
      setCompanies(data.companies || []);
    } catch (err) {
      toastError("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleToggle = async (id) => {
    try {
      const res = await toggleCompanyStatus(id);
      toastSuccess(res.message || "Company status updated");
      setToggleStatus(null);
      fetchCompanies();
    } catch {
      toastError("Failed to update status");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Partners</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage corporate entities and monitor platform commissions.</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95 cursor-pointer"
        >
          <Plus size={20} />
          <span>Add New Company</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-4xl border border-dashed border-slate-200 text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <SearchX size={48} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Partners Onboarded</h2>
          <p className="text-slate-500 max-w-xs mt-2 text-sm font-medium">Get started by adding your first enterprise partner to the platform.</p>
        </div>
      ) : (
        <div className="bg-white rounded-4xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Identity</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue Model</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          <Building2 size={22} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{company.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Mail size={12} className="text-slate-300"/> {company.email || "No email assigned"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Commission */}
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-white border border-slate-200 pl-3 pr-1 py-1 rounded-xl shadow-sm">
                        <span className="text-sm font-black text-slate-700">{company.commissionPercentage || 0}%</span>
                        <button
                          onClick={() => setEditCompany(company)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-wide">Platform Fee</div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        company.isActive 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {company.isActive ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                        {company.isActive ? "Authorized" : "Suspended"}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setSelectedCompany(company)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <BarChart3 size={14} />
                          Revenue
                        </button>

                        <button
                          onClick={() => setCommissionCompany(company)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-slate-400 text-[11px] font-bold border hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border-transparent hover:border-indigo-100 shadow-sm active:scale-95"
                          title="Commission History"
                        >
                          <History size={18} /> History
                        </button>

                        <button
                          onClick={() => setToggleStatus(company)}
                          className={`px-3.5 py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border ${
                            company.isActive 
                              ? "bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50" 
                              : "bg-slate-900 border-slate-900 text-white hover:bg-black"
                          }`}
                        >
                          {company.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS RENDERED BELOW */}
      {openModal && <AddCompanyModal onClose={() => setOpenModal(false)} onSuccess={fetchCompanies} />}
      {toggleStatus && (
        <ConfirmModal
          title={toggleStatus.isActive ? "Suspend Partner Access" : "Restore Partner Access"}
          message={`Are you sure you want to ${toggleStatus.isActive ? "deactivate" : "activate"} ${toggleStatus.name}? This will affect their ability to manage programs.`}
          onCancel={() => setToggleStatus(null)}
          onConfirm={() => handleToggle(toggleStatus._id)}
        />
      )}
      {selectedCompany && <CompanyRevenueModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />}
      {editCompany && <EditCommissionModal company={editCompany} onClose={() => setEditCompany(null)} onSuccess={fetchCompanies} />}
      {commissionCompany && <CompanyCommissionHistoryModal company={commissionCompany} onClose={() => setCommissionCompany(null)} />}
    </div>
  );
};

export default SuperAdminCompanies;