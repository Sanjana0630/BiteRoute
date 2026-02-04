import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer text-white py-3">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="mb-0">
                            &copy; {new Date().getFullYear()} <strong>BiteRoute</strong>. All rights reserved. 🍽️
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
                        <button
                            className="btn btn-outline-light btn-sm px-4 rounded-pill"
                            onClick={() => window.location.href = "mailto:support@biteroute.com"}
                        >
                            Contact Us ✉️
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
