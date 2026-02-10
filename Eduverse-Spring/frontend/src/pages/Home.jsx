import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    BookOpen,
    Calendar,
    Shield,
    Users,
    Zap,
    Mail,
    MapPin,
    Phone,
    Layout,
    ArrowRight,
    Sparkles,
    Cpu,
    Globe
} from 'lucide-react';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-blue-600">EduVerse</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#about" className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors">About</a>
                        <a href="#features" className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors">Features</a>
                        <a href="#contact" className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors">Contact</a>
                        <Link
                            to={user ? "/dashboard" : "/login"}
                            className="bg-linear-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-purple-100 hover:shadow-purple-200 transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {user ? 'Dashboard' : 'Sign In'}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Next-Gen Academic Management
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
                        Revolutionize your <br />
                        <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600">College Scheduling</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 font-medium leading-relaxed mb-12">
                        Effortlessly manage departments, students, and courses with our AI-powered genetic algorithm for automated timetable generation.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="w-full md:w-auto bg-gray-900 text-white px-10 py-5 rounded-[24px] font-black text-lg shadow-2xl hover:bg-gray-800 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
                        >
                            {user ? 'Go to Dashboard' : 'Get Started Free'}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to={user ? "/timetables" : "/login"}
                            className="w-full md:w-auto bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-[24px] font-black text-lg hover:border-purple-600 transition-all duration-300 text-center"
                        >
                            {user ? 'View Timetables' : 'Live Demo'}
                        </Link>
                    </div>

                    <div className="mt-24 relative rounded-[40px] overflow-hidden shadow-2xl shadow-purple-100 border border-gray-100 animate-scale-up">
                        <img
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2671&ux=1"
                            alt="Dashboard Preview"
                            className="w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent opacity-40"></div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <div className="text-purple-600 font-black uppercase text-xs tracking-widest mb-4">The Solution</div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                                Integrated Platform for <br />
                                Modern Education
                            </h2>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                                EduVerse is a comprehensive multi-tenant college management system designed to eliminate scheduling conflicts and administrative overhead.
                                Our system empowers HODs and Admins with data-driven insights and automated workflows.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { icon: Cpu, title: 'AI Generation', text: 'Proprietary Genetic Algorithm for zero-conflict timetables.' },
                                    { icon: Shield, title: 'Secure Access', text: 'Role-based access control for Admins, HODs, and Faculty.' },
                                    { icon: Globe, title: 'Multi-Tenant', text: 'Scalable architecture serving multiple institutions independently.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start space-x-4">
                                        <div className="mt-1 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-50 shrink-0">
                                            <item.icon className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900">{item.title}</h4>
                                            <p className="text-gray-500 font-medium text-sm">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-linear-to-r from-purple-100 to-blue-100 rounded-[50px] blur-2xl opacity-50"></div>
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2670"
                                alt="Innovation"
                                className="relative rounded-[40px] shadow-2xl border-8 border-white"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24">
                <div className="max-w-7xl mx-auto px-6 text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Core Capabilities</h2>
                    <p className="text-gray-500 font-medium">Everything you need to run a digital-first institution</p>
                </div>
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Calendar, title: 'Scheduling', color: 'bg-blue-500', text: 'Automated weekly planners with break management.' },
                        { icon: Layout, title: 'Management', color: 'bg-purple-500', text: 'Centralized control for classrooms and departments.' },
                        { icon: Users, title: 'Collaboration', color: 'bg-indigo-500', text: 'Seamless HOD-Admin approval workflows.' },
                        { icon: Zap, title: 'Performance', color: 'bg-orange-500', text: 'Real-time updates and optimization scoring.' }
                    ].map((feature, i) => (
                        <div key={i} className="group p-10 bg-white rounded-[40px] border border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-500 text-left">
                            <div className={`${feature.color} w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 shadow-2xl shadow-gray-200 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="text-white w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-500 font-medium leading-relaxed">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-gray-900 rounded-t-[80px] mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div>
                            <h2 className="text-5xl font-black text-white mb-8">Get in Touch</h2>
                            <p className="text-gray-400 text-lg mb-12 font-medium">
                                Ready to transform your institution? Our implementation team is ready to assist you.
                            </p>
                            <div className="space-y-8">
                                <div className="flex items-center space-x-6 group cursor-pointer">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                                        <Mail className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Email Us</div>
                                        <div className="text-white text-xl font-bold">support@eduverse.com</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6 group cursor-pointer">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                                        <Phone className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Call Us</div>
                                        <div className="text-white text-xl font-bold">+91 9026556565</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6 group cursor-pointer">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                                        <MapPin className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Find Us</div>
                                        <div className="text-white text-xl font-bold">CDAC Kharghar, Navi Mumbai</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 backdrop-blur-sm">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <input placeholder="Name" className="bg-white/5 border-none rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                                    <input placeholder="Email" className="bg-white/5 border-none rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 transition-all outline-none" />
                                </div>
                                <select className="w-full bg-white/5 border-none rounded-2xl px-6 py-4 text-white font-bold focus:ring-2 focus:ring-purple-500 transition-all outline-none appearance-none">
                                    <option className="bg-gray-900">General Inquiry</option>
                                    <option className="bg-gray-900">Technical Support</option>
                                    <option className="bg-gray-900">Partnership</option>
                                </select>
                                <textarea rows="4" placeholder="Your Message" className="w-full bg-white/5 border-none rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 transition-all outline-none"></textarea>
                                <button className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white font-black py-5 rounded-[24px] shadow-xl hover:shadow-purple-500/20 transform hover:-translate-y-1 transition-all duration-300">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center space-x-3">
                            <BookOpen className="text-purple-500 w-8 h-8" />
                            <span className="text-white font-black text-xl">EduVerse</span>
                        </div>
                        <p className="text-gray-500 font-bold text-sm">© 2026 EduVerse Systems. All professional rights reserved.</p>
                        <div className="flex space-x-8">
                            <a href="#" className="text-gray-500 font-bold text-sm hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-gray-500 font-bold text-sm hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
