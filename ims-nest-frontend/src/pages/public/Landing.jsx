import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  GraduationCap,
  Users,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  Bot,
  Building2,
  CheckCircle2,
  PieChart,
  Award,
  Sparkles,
} from "lucide-react";
import AIChat from "../../components/common/AIChat";
import Navbar from "../../components/common/Navbar";

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <Navbar />

      {/* --- ENHANCED DYNAMIC BACKGROUND --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-indigo-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-100 h-100 bg-blue-200/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-75 h-75 bg-purple-200/20 rounded-full blur-[80px]"></div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-48">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-indigo-100 shadow-sm text-indigo-600 text-sm font-semibold mb-8 hover:bg-white/80 transition-all cursor-default">
            <Sparkles size={16} className="animate-pulse" />
            <span>Redefining Internship Ecosystems</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight mb-8">
            Manage Internships <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-blue-500 to-purple-600">
              Without Limits.
            </span>
          </h1>

          <p className="text-slate-600 text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto mb-12 font-medium">
            A specialized MERN ecosystem bridging Companies, Mentors, and
            Interns with
            <span className="text-indigo-600"> AI-driven tracking</span> and
            automated success metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/register"
              className="cursor-pointer group flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-300 transform hover:-translate-y-1.5"
            >
              Get Started Now
              <ArrowRight
                size={22}
                className="group-hover:translate-x-2 transition-transform"
              />
            </Link>
            <a
              href="#how-it-works"
              className="cursor-pointer px-10 py-5 bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200 rounded-2xl font-bold text-xl hover:bg-white hover:border-indigo-300 transition-all shadow-sm"
            >
              View Programs
            </a>
          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES GRID ================= */}
      <section className="max-w-7xl mx-auto px-4 py-24 relative z-10">
        {/* Added: Background Glow for the whole section to fill the "khali" space */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-50/50 rounded-full blur-[120px] -z-10"></div>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Bot size={32} />}
            title="AI-Powered Insights"
            description="Leveraging Google Perspective AI for abusive content detection and Groq-powered Chatbots for 24/7 navigation assistance."
            badge="Advanced Tech"
            color="blue"
          />
          <FeatureCard
            icon={<Award size={32} />}
            title="Smart Certification"
            description="Dynamic PDF kit generation triggered automatically upon meeting 45% completion and mentor approval."
            badge="Automation"
            color="indigo"
          />
          <FeatureCard
            icon={<ShieldCheck size={32} />}
            title="Role-Based Security"
            description="JWT-secured dashboards for 5 distinct roles with cross-company data isolation and secure middleware."
            badge="Enterprise"
            color="emerald"
          />
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">
              From Guest to Professional
            </h2>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Follow our seamless transition flow powered by automated
              notifications.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            <Step
              number="01"
              title="Discover"
              desc="Browse verified company profiles and their specific internship tracks."
            />
            <Step
              number="02"
              title="AI Assistance"
              desc="Let our Groq-powered bot handle your registration and queries."
            />
            <Step
              number="03"
              title="One-Click Apply"
              desc="Apply to multiple programs. Your request goes straight to Company Admins."
            />
            <Step
              number="04"
              title="Auto-Onboard"
              desc="Once accepted, the system automatically converts your profile to an Intern role."
            />
          </div>
        </div>
      </section>

      {/* ================= ROLE HIGHLIGHTS ================= */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="bg-linear-to-br from-indigo-900 via-slate-900 to-black rounded-[3rem] p-10 md:p-20 text-white flex flex-col lg:flex-row items-center gap-16 shadow-2xl relative">
          <div className="lg:w-1/2 z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-10 leading-tight">
              Master every <br /> layer of management.
            </h2>
            <div className="space-y-8">
              <RoleItem
                title="Super Admin Control"
                desc="Set commission rates per transaction and monitor global financial performance."
              />
              <RoleItem
                title="Mentor Task-Flow"
                desc="Create, assign, and review tasks with integrated performance tracking."
              />
              <RoleItem
                title="Intern Success"
                desc="Track grades, payment history, and download PDF certificates instantly."
              />
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10 w-full">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all cursor-default">
              <PieChart size={32} className="mb-4 text-indigo-400" />
              <h4 className="text-xl font-bold mb-2">Finance Overview</h4>
              <p className="text-slate-300 text-sm">
                Detailed gross revenue and net profit breakdown.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 sm:translate-y-12 hover:bg-white/15 transition-all cursor-default">
              <Users size={32} className="mb-4 text-blue-400" />
              <h4 className="text-xl font-bold mb-2">Team Sync</h4>
              <p className="text-slate-300 text-sm">
                Export mentor and intern data to Excel or PDF effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200 py-16 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight italic">
            InternshipMS
          </h3>
          <p className="text-slate-500 font-medium mb-8">
            Built with MERN, Brevo, Groq, and Google Perspective AI.
          </p>
          <div className="flex justify-center gap-8 mb-12">
            <a
              href="#"
              className="text-slate-400 hover:text-indigo-600 transition-colors font-bold"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-indigo-600 transition-colors font-bold"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-indigo-600 transition-colors font-bold"
            >
              Support
            </a>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; 2026 Internship Management System. All rights reserved.
          </p>
        </div>
      </footer>

      {!user && <AIChat type="public" />}
    </div>
  );
};

/* --- ENHANCED SUB-COMPONENTS --- */

const FeatureCard = ({ icon, title, description, badge, color }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600",
    indigo:
      "text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:bg-indigo-600",
    emerald:
      "text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600",
  };

  return (
    <div className="group relative p-1 bg-linear-to-b from-white to-slate-50/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3">
      {/* Subtle Outer Glow on Hover */}
      <div
        className={`absolute inset-0 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-${color}-400`}
      ></div>

      <div className="relative h-full p-8 md:p-10 bg-white/80 backdrop-blur-xl rounded-[2.3rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col items-start">
        {/* Icon with Glass Background */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 shadow-sm ${colorMap[color]} group-hover:text-white group-hover:rotate-6 group-hover:scale-110`}
        >
          {icon}
        </div>

        {/* Floating Badge */}
        <span
          className={`text-[10px] uppercase tracking-[0.15em] font-black px-3 py-1.5 rounded-lg mb-6 border ${colorMap[color].split(" ")[2]} ${colorMap[color].split(" ")[0]} bg-white shadow-sm`}
        >
          {badge}
        </span>

        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        <p className="text-slate-500 leading-relaxed font-medium text-lg">
          {description}
        </p>

        {/* Decorative element to fill space */}
        <div className="mt-auto pt-8 w-full">
          <div className="h-1 w-0 group-hover:w-full bg-linear-to-r from-transparent via-indigo-500 to-transparent transition-all duration-700 opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

const Step = ({ number, title, desc }) => (
  <div className="relative group cursor-default">
    <span className="text-8xl font-black text-indigo-600/5 absolute -top-10 -left-4 group-hover:text-indigo-600/10 transition-colors">
      {number}
    </span>
    <div className="relative z-10">
      <div className="w-12 h-1.5 bg-indigo-600 rounded-full mb-6"></div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const RoleItem = ({ title, desc }) => (
  <div className="flex gap-6 group">
    <div className="shrink-0 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
      <CheckCircle2
        size={24}
        className="text-indigo-400 group-hover:text-white"
      />
    </div>
    <div>
      <h4 className="font-extrabold text-2xl mb-1 tracking-tight">{title}</h4>
      <p className="text-indigo-100/60 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Landing;
