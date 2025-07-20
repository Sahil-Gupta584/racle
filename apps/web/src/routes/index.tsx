import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  BiBarChart,
  BiCode,
  BiGlobe,
  BiPlay,
  BiRocket,
  BiShield,
} from "react-icons/bi";
import { BsDatabase, BsGithub, BsStar, BsTwitterX } from "react-icons/bs";
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { FiZap } from "react-icons/fi";
import { GiSparkles } from "react-icons/gi";
import z from "zod";

export const Route = createFileRoute("/")({
  component: LandingPage,
  validateSearch: z.object({
    redirectTo: z.string().optional(),
  }),
});

function LandingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (search.redirectTo) {
      navigate({ to: search.redirectTo });
    }
  }, [search, navigate]);

  return (
    <div className="grow bg-gradient-to-br from-forge-950 via-forge-900 to-accent-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-forge-950/90 backdrop-blur-xl border-b border-forge-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
                Racle
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-forge-300 hover:text-white text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-forge-300 hover:text-white text-sm font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#docs"
                className="text-forge-300 hover:text-white text-sm font-medium transition-colors"
              >
                Docs
              </a>
              <Link
                to="/projects"
                className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-accent-500/25"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 via-transparent to-emerald-500/10 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-forge-800/50 backdrop-blur-sm rounded-full border border-forge-700/50 text-sm text-forge-200 mb-8">
              <GiSparkles className="w-4 h-4 mr-2 text-accent-400" />
              Powering 100,000+ deployments daily
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-forge-100 to-forge-200 bg-clip-text text-transparent">
                Ship at the
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-400 via-accent-500 to-emerald-400 bg-clip-text text-transparent animate-glow">
                speed of thought
              </span>
            </h1>

            <p className="text-xl text-forge-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The deployment platform that thinks ahead. Deploy, scale, and
              monitor your applications with unprecedented speed and
              reliability.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/projects"
                className="group bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-2xl hover:shadow-accent-500/30 transform hover:scale-105"
              >
                Start Building
                <FaArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group px-10 py-4 bg-forge-800/50 backdrop-blur-sm hover:bg-forge-700/50 border border-forge-700/50 hover:border-forge-600/50 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                <BiPlay className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-forge-300">
                <BsStar className="w-5 h-5 fill-current text-amber-400" />
                <span className="font-semibold">4.9/5</span>
                <span className="text-sm">Developer Rating</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-forge-300">
                <FaCheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">99.99%</span>
                <span className="text-sm">Uptime SLA</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-forge-300">
                <FiZap className="w-5 h-5 text-accent-400" />
                <span className="font-semibold">&lt;50ms</span>
                <span className="text-sm">Cold Start</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Built for the future
            </h2>
            <p className="text-xl text-forge-300 max-w-3xl mx-auto">
              Every feature engineered for performance, designed for developers
              who demand excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-gradient-to-br from-forge-800/50 to-forge-900/50 backdrop-blur-sm rounded-2xl border border-forge-700/50 hover:border-accent-500/50 transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-forge-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-forge-900/50 to-accent-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-3">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent-400 to-emerald-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-forge-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 to-emerald-500/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-8">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-forge-300 mb-10">
            Join thousands of developers who've already made the switch to
            faster, smarter deployments.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-accent-500/30 transform hover:scale-105"
          >
            Get Started Free
            <FaArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-forge-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-forge-300 bg-clip-text text-transparent">
                Racle
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <BsGithub
                href="https://github.com/Sahil-Gupta584/racle"
                className="w-6 h-6 text-forge-400 hover:text-white cursor-pointer transition-colors"
              />
              <BsTwitterX
                href="https://x.com/sahil_builds"
                className="w-6 h-6 text-forge-400 hover:text-white cursor-pointer transition-colors"
              />
              <span className="text-forge-400 text-sm">
                © 2024 Racle. Crafted with precision.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: BiRocket,
    title: "Instant Deployments",
    description:
      "Deploy in milliseconds with our next-generation build system. Zero configuration, maximum performance.",
    iconBg: "bg-gradient-to-br from-accent-500 to-accent-600",
  },
  {
    icon: BiShield,
    title: "Fortress Security",
    description:
      "Military-grade security with automated threat detection, DDoS protection, and compliance monitoring.",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  },
  {
    icon: BiGlobe,
    title: "Global Mesh Network",
    description:
      "400+ edge locations with intelligent routing. Your users experience blazing speed, everywhere.",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    icon: BiBarChart,
    title: "Predictive Analytics",
    description:
      "AI-powered insights that predict performance issues before they happen. Stay ahead of problems.",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  {
    icon: BiCode,
    title: "Developer Experience",
    description:
      "Built by developers, for developers. Intuitive CLI, powerful APIs, and seamless integrations.",
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  {
    icon: BsDatabase,
    title: "Edge Computing",
    description:
      "Run your code at the edge with our serverless functions. Ultra-low latency, infinite scale.",
    iconBg: "bg-gradient-to-br from-teal-500 to-teal-600",
  },
];

const stats = [
  { value: "99.99%", label: "Uptime Guarantee" },
  { value: "<50ms", label: "Global Latency" },
  { value: "100M+", label: "Requests/Day" },
  { value: "200+", label: "Edge Locations" },
];

export default LandingPage;
