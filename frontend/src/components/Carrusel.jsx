import React, { useRef, useEffect } from 'react';
import '../App.css';

function Carrusel() {
    const sliderRef = useRef(null);
    
    // Función para activar el carrusel
    const handleNavigation = (direction) => {
        if (!sliderRef.current) return;
        
        const items = sliderRef.current.children;
        
        if (direction === 'next') {
            sliderRef.current.appendChild(items[0]);
        } else if (direction === 'prev') {
            sliderRef.current.insertBefore(items[items.length - 1], items[0]);
        }
    };

    return (
        <section className="carrusel">
            <div className="carrousel">
                <ul className="slider" ref={sliderRef}>
                    <li
                        className="item"
                        style={{ backgroundImage: `url('https://cdn.mos.cms.futurecdn.net/dP3N4qnEZ4tCTCLq59iysd.jpg')` }}
                    >
                        <div className="content">
                            <h2 className="title">"Lossless Youths"</h2>
                            <p className="description">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga
                                voluptatum, iure corporis inventore praesentium nisi. Id laboriosam
                                ipsam enim.
                            </p>
                            <button>Read More</button>
                        </div>
                    </li>
                    <li
                        className="item"
                        style={{ backgroundImage: `url('https://i.redd.it/tc0aqpv92pn21.jpg')` }}
                    >
                        <div className="content">
                            <h2 className="title">Bienvenido a Brisas de Mamporal</h2>
                            <p className="description">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga
                                voluptatum, iure corporis inventore praesentium nisi. Id laboriosam
                                ipsam enim.
                            </p>
                            <button>Read More</button>
                        </div>
                    </li>
                    <li
                        className="item"
                        style={{ backgroundImage: `url('https://wharferj.files.wordpress.com/2015/11/bio_north.jpg')` }}
                    >
                        <div className="content">
                            <h2 className="title">"The Gate Keeper"</h2>
                            <p className="description">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga
                                voluptatum, iure corporis inventore praesentium nisi. Id laboriosam
                                ipsam enim.
                            </p>
                            <button>Read More</button>
                        </div>
                    </li>
                    <li
                        className="item"
                        style={{ backgroundImage: `url('https://images7.alphacoders.com/878/878663.jpg')` }}
                    >
                        <div className="content">
                            <h2 className="title">"Last Trace Of Us"</h2>
                            <p className="description">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga
                                voluptatum, iure corporis inventore praesentium nisi. Id laboriosam
                                ipsam enim.
                            </p>
                            <button>Read More</button>
                        </div>
                    </li>
                    <li
                        className="item"
                        style={{ backgroundImage: `url('https://theawesomer.com/photos/2017/07/simon_stalenhag_the_electric_state_6.jpg')` }}
                    >
                        <div className="content">
                            <h2 className="title">"Urban Decay"</h2>
                            <p className="description">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga
                                voluptatum, iure corporis inventore praesentium nisi. Id laboriosam
                                ipsam enim.
                            </p>
                            <button>Read More</button>
                        </div>
                    </li>
                    {/* <li
                        className="item"
                        style={{ backgroundImage: `url('https://da.se/app/uploads/2015/09/simon-december1994.jpg')` }}
                    >
                        <div className="content">
                            <h2 className="title">"The Migration"</h2>
                            <p className="description">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore fuga
                                voluptatum, iure corporis inventore praesentium nisi. Id laboriosam
                                ipsam enim.
                            </p>
                            <button>Read More</button>
                        </div>
                    </li> */}
                </ul>
                <nav className="nav">
                    <button className="btn prev" onClick={() => handleNavigation('prev')}>
                        <ion-icon name="arrow-back-outline">←</ion-icon>
                    </button>
                    <button className="btn next" onClick={() => handleNavigation('next')}>
                        <ion-icon name="arrow-forward-outline">→</ion-icon>
                    </button>
                </nav>
            </div>
        </section>
    );
}

export default Carrusel;
