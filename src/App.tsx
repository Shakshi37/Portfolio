import React, { useEffect, useState, useContext, createContext } from 'react';
import { Menu, Moon, Sun, Github, Linkedin, Mail, Download, Code2, Globe, Database, Terminal } from 'lucide-react';
import axios from 'axios';
import Certificates from './components/Certificates';
import Experiences from './components/Experiences';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth, api } from './context/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoLink: string;
  githubLink: string;
}

interface Skill {
  _id: string;
  category: string;
  icon: string;
  items: string[];
}

// Create a context for theme functionality
interface ThemeContextType {
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ toggleDarkMode: () => {} });

function PortfolioContent({ isDarkMode }: { isDarkMode: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const { logout } = useAuth();
  // Get toggleDarkMode function from parent
  const { toggleDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the configured API instance that handles authorization
        const [projectsRes, skillsRes] = await Promise.all([
          api.get('/projects'),
          api.get('/skills')
        ]);
        
        setProjects(projectsRes.data);
        setSkills(skillsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please check the console for more information.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadCV = async () => {
    try {
      setDownloading(true);
      // Use API instance for authorized requests
      const response = await api.get('/download-cv', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SHAKSHI_THAKUR.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CV:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      Globe,
      Terminal,
      Database,
      Code2
    };
    return icons[iconName as keyof typeof icons];
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use API instance for authorized requests
      await api.post('/contact', formData);
      setFormStatus({
        type: 'success',
        message: 'Message sent successfully! I will get back to you soon.'
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setFormStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {error}
        </div>
        <button
          onClick={logout}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`fixed w-full z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ST
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink href="#about" isDark={isDarkMode}>About</NavLink>
              <NavLink href="#projects" isDark={isDarkMode}>Projects</NavLink>
              <NavLink href="#skills" isDark={isDarkMode}>Skills</NavLink>
              <NavLink href="#experience" isDark={isDarkMode}>Experience</NavLink>
              <NavLink href="#certificates" isDark={isDarkMode}>Certificates</NavLink>
              <NavLink href="#contact" isDark={isDarkMode}>Contact</NavLink>
              <button
                onClick={logout}
                className={`${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'} px-3 py-2 rounded-md text-sm font-medium`}
              >
                Logout
              </button>
              {/* Theme toggle button after logout */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink href="#about" isDark={isDarkMode}>About</MobileNavLink>
              <MobileNavLink href="#projects" isDark={isDarkMode}>Projects</MobileNavLink>
              <MobileNavLink href="#skills" isDark={isDarkMode}>Skills</MobileNavLink>
              <MobileNavLink href="#experience" isDark={isDarkMode}>Experience</MobileNavLink>
              <MobileNavLink href="#certificates" isDark={isDarkMode}>Certificates</MobileNavLink>
              <MobileNavLink href="#contact" isDark={isDarkMode}>Contact</MobileNavLink>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium border-t mt-2 pt-2"
                style={{ color: isDarkMode ? '#fff' : '#374151' }}
              >
                Logout
              </button>
              {/* Theme toggle for mobile after logout */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full px-3 py-2 text-base font-medium"
                style={{ color: isDarkMode ? '#fff' : '#374151' }}
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                <span className="ml-2">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Hi, I'm Shakshi Thakur
              </h1>
              <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A Backend Developer specialized in Node.js, JWT, and Database Management, building secure and scalable backend systems.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={handleDownloadCV}
                  disabled={downloading}
                  className={`bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition duration-300 ${downloading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  <Download className="w-5 h-5" />
                  <span>{downloading ? 'Downloading...' : 'Download CV'}</span>
                </button>
                <div className="flex space-x-4">
                  <SocialLink href="https://github.com/Shakshi37" icon={<Github />} isDark={isDarkMode} />
                  <SocialLink href="https://www.linkedin.com/in/thakurshakshi/" icon={<Linkedin />} isDark={isDarkMode} />
                  <SocialLink href="mailto:thakurshakshi22770@gmail.com" icon={<Mail />} isDark={isDarkMode} />
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="http://localhost:5000/public/profile.png"
                alt="Profile"
                className="rounded-full w-64 h-64 object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            About Me
          </h2>
          <div className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <p className="text-lg mb-4">
            I am a dynamic and detail-oriented Node.js Backend Developer with over 2.5 years of experience, including a 6-month internship. My expertise lies in designing and building robust, scalable backend systems and solutions. I specialize in creating RESTful APIs, implementing secure authentication mechanisms, and managing complex databases such as SQL Server, MongoDB, Redis, and MySQL.
            </p>
            <p className="text-lg mb-4">
            Throughout my career, I have successfully developed and optimized systems for HR management, trip management, and task automation. I have built secure and efficient modules like Login, Leave Management, and Document Management for large-scale applications. I am particularly skilled at debugging production issues, implementing security enhancements, and ensuring the performance of both frontend and backend systems.
            </p>
            <p className="text-lg">
            I excel in task automation, event management, and delivering user-centric applications. As a collaborative team player, I have worked closely with cross-functional teams to integrate new features, ensuring smooth communication across all system components. My technical toolkit includes Node.js, Sails.js, Express.js, JWT authentication, and comprehensive API development. I am always striving to optimize system performance and maintain system reliability across projects, from initial development through to deployment.
            I am passionate about growing as a developer and delivering solutions that have a meaningful impact.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Featured Projects
          </h2>
          {loading ? (
            <div className="text-center">Loading projects...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className={`rounded-lg overflow-hidden shadow-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-white'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="mr-3">
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {project.title}
                      </h3>
                    </div>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isDarkMode
                              ? 'bg-gray-600 text-gray-200'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <a
                        href={project.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition duration-300"
                      >
                        Live Demo
                      </a>
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition duration-300"
                      >
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Skills & Expertise
          </h2>
          {loading ? (
            <div className="text-center">Loading skills...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {skills.map((skillGroup) => {
                const IconComponent = getIconComponent(skillGroup.icon);
                return (
                  <div
                    key={skillGroup._id}
                    className={`p-6 rounded-lg ${
                      isDarkMode ? 'bg-gray-800 shadow-dark' : 'bg-white shadow-lg'
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <div className="mr-3">
                        <img 
                          src={skillGroup.icon} 
                          alt={skillGroup.category} 
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {skillGroup.category}
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {skillGroup.items.map((skill, skillIndex) => (
                        <li
                          key={skillIndex}
                          className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Experiences isDarkMode={isDarkMode} />
      </section>

      {/* Certificates Section */}
      <section id="certificates" className="py-20 px-4">
        <Certificates isDarkMode={isDarkMode} />
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-20 px-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                I'm always interested in hearing about new projects and opportunities.
                Whether you have a question or just want to say hi, feel free to reach out!
              </p>
              <div className="space-y-4">
                <a
                  href="mailto:thakurshakshi22770@gmail.com"
                  className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Mail className="w-5 h-5" />
                  <span>thakurshakshi22770@gmail.com</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/thakurshakshi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {formStatus.type && (
                <div
                  className={`p-4 rounded-lg ${
                    formStatus.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {formStatus.message}
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className={`block text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  } focus:ring-blue-500 focus:border-blue-500`}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();

  // Toggle dark mode effect
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  return (
    <ThemeContext.Provider value={{ toggleDarkMode }}>
      <div className={isDarkMode ? 'dark' : ''}>
        {/* Theme toggle button is now handled within the Login component */}
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? 
              <Navigate to="/" /> : 
              <Login 
                onLogin={(token, user) => login(token, user)}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
          } />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<PortfolioContent isDarkMode={isDarkMode} />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  );
}

const NavLink = ({ href, children, isDark }: { href: string; children: React.ReactNode; isDark: boolean }) => (
  <a
    href={href}
    className={`${
      isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
    } px-3 py-2 text-sm font-medium transition duration-300`}
  >
    {children}
  </a>
);

const MobileNavLink = ({ href, children, isDark }: { href: string; children: React.ReactNode; isDark: boolean }) => (
  <a
    href={href}
    className={`block px-3 py-2 text-base font-medium ${
      isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </a>
);

const SocialLink = ({ href, icon, isDark }: { href: string; icon: React.ReactNode; isDark: boolean }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`p-2 rounded-full ${
      isDark
        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    } transition duration-300`}
  >
    {icon}
  </a>
);

export default App;