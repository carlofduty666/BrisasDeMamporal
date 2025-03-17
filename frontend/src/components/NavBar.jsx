import React from 'react'

import '../App.css'

function NavBar() {


  return (

    <nav>
        <div className="nav-contenedor">
            <div className="nav-logo">
                <a href="">
                    <img src="../public/img/1.colegioLogo.png" alt="Brisas de Mamporal" />
                </a>
            </div>
            <div className="nav-pages">
                <div>
                    <a href="#inicio">Inicio</a>
                </div>
                <div>
                    <a href="#nuestraInstitucion">Nuestra Institución</a>
                </div>
                <div>
                    <a href="#calendarioAcademico">Calendario académico</a>
                </div>
            </div>
            <div className="nav-button">
                <button className="btn-nav">Iniciar sesión</button>
                <button className="btn-nav">Registrarse</button>
            </div>
        </div>
    </nav>
  

    )       
}

export default NavBar