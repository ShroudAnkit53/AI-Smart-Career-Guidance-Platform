import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, InfoIcon, HelpCircle, Settings, User, LogOut, ChevronDown } from "lucide-react";
import logo from "../../assets/logo.png";

const Sidebar = ({ user, isOpen, setIsOpen }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const menuItemClass = (path) =>
    `block transition cursor-pointer ${
      location.pathname === path
        ? "text-orange-500"
        : "hover:text-orange-500"
    }`;

  return (
    <>
      {/* Overlay (mobile only) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed md:sticky
    top-0 left-0
    h-screen
    w-64
    flex-shrink-0
    bg-neutral-900
    p-6
    border-r border-neutral-800
    flex flex-col justify-between
    z-50
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0`}
      >
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={logo}
                alt="CareerAI Logo"
                className="w-12 h-12 rounded-lg"
              />
              <h1 className="text-2xl text-orange-500 font-500">
                CareerAI
              </h1>
            </div>
            <p className="text-sm text-neutral-400">
              Build Awesome Skills
            </p>
          </div>

          {/* Menu */}
          <div className="space-y-4 text-neutral-300">
            <button
              onClick={() => {
                navigate("/home");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 ${menuItemClass("/home")}`}
            >
              <Home size={20} />
              Home
            </button>

            <button
              onClick={() => {
                navigate("/about");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 ${menuItemClass("/about")}`}
            >
              <InfoIcon size={20} />
              About
            </button>

            <button
              onClick={() => {
                navigate("/faq");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 ${menuItemClass("/faq")}`}
            >
              <HelpCircle size={20} />
              FAQ
            </button>

            {/* Settings Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 block hover:text-orange-500 transition cursor-pointer"
              >
                <Settings size={20} />
                Settings
                <ChevronDown size={16} className={`ml-auto transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="absolute mt-2 bg-neutral-800 p-3 rounded-lg shadow-lg w-40 border border-neutral-700">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left hover:text-orange-500 mb-2 transition cursor-pointer"
                  >
                    <User size={18} />
                    Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left text-red-500 hover:opacity-80 transition cursor-pointer"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-neutral-500">
          © 2026 CareerAI
        </div>
      </div>
    </>
  );
};

export default Sidebar;