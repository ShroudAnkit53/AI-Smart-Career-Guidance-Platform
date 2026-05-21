// import { resourcesLinks, platformLinks, communityLinks } from "../../constants";
// const Footer = () => {
//   return (
//     <footer className="mt-20 border-t py-10 border-neutral-700">
//       <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
//         <div>
//           <h3 className="text-md font-semibold mb-4">Resources</h3>
//           <ul className="space-y-2">
//             {resourcesLinks.map((link, index) => (
//               <li key={index}>
//                 <a
//                   href={link.href}
//                   className="text-neutral-300 hover:text-white"
//                 >
//                   {link.text}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <h3 className="text-md font-semibold mb-4">Platform</h3>
//           <ul className="space-y-2">
//             {platformLinks.map((link, index) => (
//               <li key={index}>
//                 <a
//                   href={link.href}
//                   className="text-neutral-300 hover:text-white"
//                 >
//                   {link.text}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div>
//           <h3 className="text-md font-semibold mb-4">Community</h3>
//           <ul className="space-y-2">
//             {communityLinks.map((link, index) => (
//               <li key={index}>
//                 <a
//                   href={link.href}
//                   className="text-neutral-300 hover:text-white"
//                 >
//                   {link.text}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import logo from "../../assets/logo.png";
import { resourcesLinks, platformLinks, communityLinks } from "../../constants";

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-neutral-700">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          
          {/* Left Section */}
          <div className="lg:w-1/3">
            <div className="flex items-center mb-4">
              <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
              <span className="text-xl font-semibold">CareerAI</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              CareerAI is an AI-powered smart career guidance platform that 
              analyzes skills, detects gaps, and provides personalized 
              recommendations to help students build future-ready careers.
            </p>
          </div>

          {/* Right Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:w-2/3">
            
            <div>
              <h3 className="text-md font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {resourcesLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-md font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-md font-semibold mb-4">Community</h3>
              <ul className="space-y-2">
                {communityLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white transition"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 border-t border-neutral-800 pt-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} CareerAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
