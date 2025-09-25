import React from "react"; 
import logo from "../assets/logo.jpg";
import AuthForm from "../components/AuthForm";
import "../styles/auth.css";
const AuthPage=({setUser})=>(
    <div className="authpage">
        <div className="auth-left">
            <img src={logo} alt="logo" />
            <h1>Farmer Cart</h1>
            <p>A place conecting farmer sto customers</p>
        </div>
        <div className="auth-right">
            <AuthForm setUser={setUser}></AuthForm>
            <footer>
                copyright &copy; 2024 Farmer Cart; All rights reserved.
            </footer>
        </div>
    </div>
    )

export default AuthPage;