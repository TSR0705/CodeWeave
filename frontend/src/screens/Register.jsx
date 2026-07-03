import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/");
        }
    }, [navigate]);

    function submitHandler(e) {
        e.preventDefault();

        axios
            .post("/users/register", {
                email,
                password,
            })
            .then((res) => {
                console.log(res.data);
                localStorage.setItem("token", res.data.token);
                setUser(res.data.user);
                navigate("/");
            })
            .catch((err) => {
                console.log(err.response?.data);
                alert(err.response?.data?.errors?.[0]?.msg || "Registration failed");
            });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian-950 bg-grid-pattern px-4 relative overflow-hidden font-sans">
            {/* Top-center ambient indigo glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent-violet/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="w-full max-w-sm glass-panel p-8 sm:p-10 rounded-2xl border-white/5 shadow-premium-glow relative z-10 hover:border-accent-violet/20 transition-all duration-300">
                <header className="text-center mb-8">
                    <div className="w-14 h-14 bg-obsidian-900 border border-obsidian-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <i className="ri-user-add-line text-2xl text-accent-violet"></i>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Create Account</h2>
                    <p className="text-sm text-obsidian-400">Join the real-time coding sandbox</p>
                </header>

                <form onSubmit={submitHandler} className="space-y-5">
                    <div>
                        <label
                            className="block text-xs font-bold text-obsidian-300 uppercase tracking-widest mb-2"
                            htmlFor="email"
                        >
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-obsidian-400">
                                <i className="ri-mail-line text-base"></i>
                            </span>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                id="email"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-800 focus:border-accent-violet rounded-xl text-sm text-white placeholder-obsidian-500 focus:outline-none focus:ring-0 transition-all"
                                placeholder="name@domain.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            className="block text-xs font-bold text-obsidian-300 uppercase tracking-widest mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-obsidian-400">
                                <i className="ri-lock-line text-base"></i>
                            </span>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type="password"
                                id="password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-obsidian-900 border border-obsidian-800 focus:border-accent-violet rounded-xl text-sm text-white placeholder-obsidian-500 focus:outline-none focus:ring-0 transition-all"
                                placeholder="Min. 3 characters"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-white hover:bg-obsidian-200 text-obsidian-950 font-bold rounded-xl transition-all duration-200 mt-6 flex items-center justify-center gap-2 text-sm shadow-md uppercase tracking-wider active:scale-[0.98]"
                    >
                        <span>Register</span>
                        <i className="ri-check-line text-lg"></i>
                    </button>
                </form>

                <footer className="text-center mt-8 pt-6 border-t border-obsidian-850/60">
                    <p className="text-sm text-obsidian-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-white hover:text-accent-violet font-semibold transition-colors"
                        >
                            Login here
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Register;
