import React from "react";
import {
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
  FileText,
  Brain,
  GraduationCap,
  Building2,
} from "lucide-react";
import Card from "./Components/Card";
import Arrow from "./Components/Arrow";
import GoogleFormsHeader from "./Components/GoogleFormsHeader";
import Option from "./Components/Option";
import Legend from "./Components/Legend";
import FormOption from "./Components/FormOption";
import { Link } from "react-router";
import { motion } from "motion/react";

export default function LandingPage() {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-cyan-600 to-cyan-700">
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent">
        <div className="text-2xl font-bold text-white">QuizIt</div>
        <div className="flex items-center gap-8">
          <Link to="/auth">
            <button className="px-6 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      <section className="px-8 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[6fr_6fr] gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Turn any <span className="text-orange-300">Quiz</span>
              <br />
              into a Real
              <br />
              Assessment
            </h1>
            <p className="text-xl text-cyan-100 mb-8">
              Convert <span className="font-semibold">Google Forms</span>.
              Generate with AI.
              <br />
              Conduct, analyze, and secure your
              <br />
              quiz effortlessly.
            </p>
            <div className="flex gap-4 mb-8">
              <button
                className="px-6 py-3 bg-white text-cyan-700 rounded-lg
    flex items-center gap-2
    transition-all duration-200
    hover:bg-cyan-50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <img
                  src="/form.svg"
                  alt="google forms icon"
                  className="w-7 h-7"
                />
                Convert Google Form
              </button>

              <button
                className="px-5 py-3 bg-orange-400 text-white rounded-lg
    transition-all duration-200
    hover:bg-orange-500 hover:shadow-lg hover:-translate-y-0.5"
              >
                Generate with AI
              </button>
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle size={20} />
                <span>Anti-Cheat</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle size={20} />
                <span>Instant Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <CheckCircle size={20} />
                <span>Under 2 Minutes</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-6 bg-white/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex gap-10"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  variants={card}
                >
                  <Card
                    title=" "
                    header={<GoogleFormsHeader />}
                    headerClass="bg-purple-500"
                  >
                    <div className="space-y-4 text-sm font-roboto">
                      <div>
                        <div className="h-3 w-40 bg-gray-300 rounded mb-2" />
                        <div className="h-3 w-full bg-gray-200 rounded" />
                      </div>

                      <div className="space-y-2">
                        <FormOption />
                        <FormOption />
                        <FormOption />
                        <FormOption />
                      </div>

                      <div className="text-xs text-red-500 pt-1">
                        * Required
                      </div>
                    </div>
                  </Card>
                </motion.div>
                <Arrow />
                <motion.div
                  variants={card}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card title="Quiz Builder">
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="h-3 w-32 bg-gray-300 rounded mb-2" />
                        <div className="h-3 w-full bg-gray-200 rounded" />
                      </div>

                      <div className="space-y-2">
                        <Option />
                        <Option />
                        <Option correct />
                        <Option />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-gray-500">
                          Single Correct
                        </span>
                        <span className="text-xs font-medium text-teal-600">
                          +5 pts
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                <Arrow />
                <motion.div
                  variants={card}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card title="Analytics">
                    <div className="flex flex-col items-center">
                      <div className="relative h-28 w-28 rounded-full bg-[conic-gradient(#14b8a6_0deg_170deg,#fb923c_170deg_280deg,#60a5fa_280deg_360deg)]"></div>

                      <div className="mt-4 space-y-2 w-full text-xs">
                        <Legend color="bg-teal-500" label="Correct" />
                        <Legend color="bg-orange-400" label="Wrong" />
                        <Legend color="bg-blue-400" label="Skipped" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-orange-50 rounded-2xl p-8">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="text-yellow-500 w-8 h-8" />
              <h3 className="text-2xl font-bold text-yellow-500">
                For Teachers
              </h3>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Create quizzes in seconds
            </h4>
            <p className="text-gray-600 mb-6">
              Need a quiz fast? Use our AI quiz builder to instantly generate
              quizzes for any topic.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-8">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="text-blue-500 w-8 h-8" />
              <h3 className="text-2xl font-bold text-blue-500">
                For Companies
              </h3>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Make placements simpler
            </h4>
            <p className="text-gray-600 mb-6">
              Conduct secure assessments that are proctored, timed, and
              intelligently analyzes with detailed reports for each candidate.
            </p>
          </div>

          <div className="bg-teal-50 rounded-2xl p-8">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="text-green-500 w-8 h-8" />
              <h3 className="text-2xl font-bold text-green-500">
                For Everyone
              </h3>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Create and conduct instant quizzes
            </h4>
            <p className="text-gray-600 mb-6">
              Quickly craft and run quizzes with an easy-to-use interface,
              whether it's for fun, education, or assesments.
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Everything you need to run better quizzes
        </h2>
        <p className="text-xl text-cyan-100 mb-12">
          No setup. No learning curve. Just smarter quizzes.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-8">
            <Brain className="mx-auto mb-4 text-cyan-600" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              AI Quiz Builder
            </h3>
            <p className="text-gray-600">
              Describe any topic and our AI will generate openized quizzes in
              seconds.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-8">
            <FileText className="mx-auto mb-4 text-cyan-600" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Google Forms Converter
            </h3>
            <p className="text-gray-600">
              Easily upload and transform Google Forms into professional quizzes
              —no redesign needed.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-8">
            <Shield className="mx-auto mb-4 text-cyan-600" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Anti-Cheat Detection
            </h3>
            <p className="text-gray-600">
              Monitor tab switches, detect browser focus, and prevent cheating
              with smart anti-cheat measures.
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 py-20 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Run Your Next Quiz the Right Way
        </h2>
        <p className="text-xl text-cyan-100 mb-8">
          No setup. No learning curve. Just smarter quizzes.
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <button
            className="px-6 py-3 bg-white text-cyan-700 rounded-lg
    flex items-center gap-2
    transition-all duration-200
    hover:bg-cyan-50 hover:shadow-lg hover:-translate-y-0.5"
          >
            <img src="/form.svg" alt="google forms icon" className="w-7 h-7" />
            Convert Google Form
          </button>

          <button
            className="px-5 py-3 bg-orange-400 text-white rounded-lg
    transition-all duration-200
    hover:bg-orange-500 hover:shadow-lg hover:-translate-y-0.5"
          >
            Generate with AI
          </button>
        </div>
        <div className="flex gap-8 justify-center text-white">
          <div className="flex items-center gap-2">
            <Zap size={20} />
            <span>Instant Conversion</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain size={20} />
            <span>Smart Question Creation</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} />
            <span>Advanced Analytics</span>
          </div>
        </div>
      </section>
    </div>
  );
}
