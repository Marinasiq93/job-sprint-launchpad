
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full jobsprint-gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JS</span>
            </div>
            <h1 className="text-xl font-semibold">JobSprints</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-jobsprint-blue hover:bg-jobsprint-blue/90">Signup</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
          <section className="text-center space-y-6">
            <h2 className="text-4xl font-bold tracking-tight">
              Organize Your Job Search with JobSprints
            </h2>
            <p className="text-xl text-gray-500">
              Boost your job search productivity with our sprint-based approach to applications
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="bg-jobsprint-blue hover:bg-jobsprint-blue/90">
                  Get Started
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  View Dashboard Demo
                </Button>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-8 py-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-jobsprint-blue text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Job Sprints</h3>
              <p className="text-gray-600">
                Organize your job search into focused sprints for better results
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-jobsprint-blue text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold">Company Research</h3>
              <p className="text-gray-600">
                Get AI-powered insights on companies before applying
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-jobsprint-blue text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold">Job Fit Analysis</h3>
              <p className="text-gray-600">
                Analyze how well your profile matches job requirements
              </p>
            </div>
          </section>

          <section className="border-t pt-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Explore App Sections</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/login" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                Login
              </Link>
              <Link to="/signup" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                Signup
              </Link>
              <Link to="/dashboard" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                Dashboard
              </Link>
              <Link to="/dashboard/profile" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                Profile
              </Link>
              <Link to="/dashboard/new-sprint" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                New Sprint
              </Link>
              <Link to="/onboarding/documents" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                Document Upload
              </Link>
              <Link to="/test-runner" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                Test Runner
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-gray-500">
          <p>&copy; 2025 JobSprints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
