import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 px-4  text-white flex justify-between items-center h-12">
      <div className="mycontainer flex flex-row justify-between items-center">
        <div className="logo font-bold text-white text-2xl flex items-center">
          <span>&lt;</span>
          PassMan
          <span>/&gt;</span>
        </div>
        {/* <ul>
          <li className="flex gap-4">
            <a className="hover:font-bold" href="/">
              Home
            </a>
            <a className="hover:font-bold" href="#">
              About
            </a>
            <a className="hover:font-bold" href="#">
              Contact
            </a>
          </li>
        </ul> */}
        <button className=" github text-black hover:scale-105 hover:transition-all rounded-md flex items-center bg-gray-50 px-1 cursor-pointer ring-black ring-1">
          <img className="w-9 " src="icons/github.svg" alt="GitHub" />
          <a
            href="https://github.com/your-username/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="github-btn"
          >
            <span className="font-bold px-2">GitHub</span>
          </a>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
