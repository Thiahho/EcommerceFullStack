import React, { useState, useEffect } from 'react';

const images = [
  { src: '/img/Local1.jpeg', alt: 'Frente del local DrCell' },
  { src: '/img/Local2.jpeg', alt: 'Vista lateral del local DrCell' }
];
const images2 = [
  { src: '/img/Local3.jpeg', alt: 'Interior del local DrCell' },
  { src: '/img/Local4.jpeg', alt: 'Interior del local DrCell' }
];

const AboutUs = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentImage2, setCurrentImage2] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000); // Cambia imagen cada 4 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval2 = setInterval(() => {
      setCurrentImage2((prev) => (prev + 1) % images2.length);
    }, 5000); // Cambia imagen cada 5 segundos (diferente tiempo para variar)
    return () => clearInterval(interval2);
  }, []);

  const handleNextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage2 = () => {
    setCurrentImage2((prev) => (prev + 1) % images2.length);
  };

  const handlePrevImage2 = () => {
    setCurrentImage2((prev) => (prev - 1 + images2.length) % images2.length);
  };

  return (
    <div className="bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-16">

        {/* Seccion Nosotros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="text-left">
            <h2 className="text-4xl font-bold text-[#17436b] mb-2">Nosotros</h2>
            <h1 className="text-5xl font-bold text-[#217AB6] mb-4">Somos DRCELL, Reparacion De Equipos</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Desde 2006 en <strong className="font-semibold text-gray-800">Libertador 326, Moreno</strong>, nos dedicamos a devolverle la vida a tus dispositivos con honestidad y expertise. Somos una tienda familiar atendida por su dueño, donde cada reparación lleva nuestro sello de calidad y <strong className="font-semibold text-gray-800">garantía escrita</strong>.
            </p>
            <button
              className="bg-[#17436b] text-white font-bold py-3 px-6 rounded-lg hover:bg[#17436b] transition duration-300 transform hover:scale-105"
              onClick={() => window.open('https://www.google.com/maps/place/Dr.+Cell/@-34.6456948,-58.7926662,17z/data=!3m1!4b1!4m6!3m5!1s0x95bc9451ecf381a7:0x3b2ca7b87e0d586c!8m2!3d-34.6456992!4d-58.7900859!16s%2Fg%2F11j8zg3616?entry=ttu&g_ep=EgoyMDI1MDYyMi4wIKXMDSoASAFQAw%3D%3D', '_blank')}
            >
              Ubicanos &rarr;
            </button>
          </div>
          <div className="relative w-full flex items-center justify-center my-4">
            {/* Imagen principal */}
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="rounded-lg shadow-lg max-w-full max-h-[450px] object-contain mx-auto transition-opacity duration-700"
              style={{ width: 'auto', height: 'auto' }}
            />
            {/* Botón anterior */}
            <button
              onClick={handlePrevImage}
              aria-label="Imagen anterior del local"
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#17436b] font-bold rounded-full p-2 shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#217AB6]"
              tabIndex={0}
            >
              &larr;
            </button>
            {/* Botón siguiente */}
            <button
              onClick={handleNextImage}
              aria-label="Siguiente imagen del local"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#17436b] font-bold rounded-full p-2 shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#217AB6]"
              tabIndex={0}
            >
              &rarr;
            </button>
            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                  className={`w-3 h-3 rounded-full border-2 border-[#217AB6] ${currentImage === idx ? 'bg-[#217AB6]' : 'bg-white'}`}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Seccion Nuestros Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative w-full flex items-center justify-center my-4">
            {/* Imagen principal del segundo carrusel */}
            <img
              src={images2[currentImage2].src}
              alt={images2[currentImage2].alt}
              className="rounded-lg shadow-lg max-w-xs w-full h-auto object-cover transition-opacity duration-700"
            />
            {/* Botón anterior */}
            <button
              onClick={handlePrevImage2}
              aria-label="Imagen anterior del interior"
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#17436b] font-bold rounded-full p-2 shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#217AB6]"
              tabIndex={0}
            >
              &larr;
            </button>
            {/* Botón siguiente */}
            <button
              onClick={handleNextImage2}
              aria-label="Siguiente imagen del interior"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#17436b] font-bold rounded-full p-2 shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#217AB6]"
              tabIndex={0}
            >
              &rarr;
            </button>
            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images2.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage2(idx)}
                  aria-label={`Ver imagen ${idx + 1} del interior`}
                  className={`w-3 h-3 rounded-full border-2 border-[#217AB6] ${currentImage2 === idx ? 'bg-[#217AB6]' : 'bg-white'}`}
                  tabIndex={0}
                />
              ))}
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-5xl font-bold text-[#17436b] mb-6">Nuestros pilares</h2>
            <ul className="space-y-4 text-gray-700 leading-relaxed">
              <li><strong className="font-semibold text-[#217AB6]">18 años de experiencia:</strong> Más de 15,000 reparaciones exitosas.</li>
              <li><strong className="font-semibold text-[#217AB6]">Diagnóstico claro:</strong> Te explicamos el problema sin tecnicismos innecesarios.</li>
              <li><strong className="font-semibold text-[#217AB6]">Garantía real:</strong> 15 días en todas las reparaciones.</li>
            </ul>
       
          </div>
        </div>

        {/* Seccion Servicios */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#17436b] mt-2 mb-4">Conoce Nuestros Servicios</h2>
        </div>

        {/* Seccion Por que elegirnos */}
        <div className="text-center mb-12">
          <h3 className="text-[#217AB6] font-semibold uppercase tracking-wider">Por qué elegirnos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Item 1 */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md text-left transition-transform transform hover:scale-105 hover:shadow-xl">
            <span className="text-5xl font-bold text-[#217AB6]">01</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Atención personalizada</h3>
            <p className="text-gray-600 leading-relaxed">Tu dispositivo es revisado por expertos con décadas de experiencia.</p>
          </div>
          {/* Item 2 */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md text-left transition-transform transform hover:scale-105 hover:shadow-xl">
            <span className="text-5xl font-bold text-[#217AB6]">02</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Precios justos</h3>
            <p className="text-gray-600 leading-relaxed">Sin costos ocultos; presupuesto previo con tu aprobación.</p>
          </div>
          {/* Item 3 */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md text-left transition-transform transform hover:scale-105 hover:shadow-xl">
            <span className="text-5xl font-bold text-[#217AB6]">03</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Repuestos de calidad</h3>
            <p className="text-gray-600 leading-relaxed">Usamos componentes originales o equivalentes certificados. No trabajamos con repuestos genéricos o usados.</p>
          </div>
          {/* Item 4 */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md text-left transition-transform transform hover:scale-105 hover:shadow-xl">
            <span className="text-5xl font-bold text-[#217AB6]">04</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Rapidez</h3>
            <p className="text-gray-600 leading-relaxed">98% de las reparaciones se completan en menos de 3 horas.</p>
          </div>
          {/* Item 5 */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md text-left transition-transform transform hover:scale-105 hover:shadow-xl">
            <span className="text-5xl font-bold text-[#217AB6]">05</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Garantía</h3>
            <p className="text-gray-600 leading-relaxed">Ofrecemos garantía en los repuestos de 15 días. Siempre con su voleta en mano.</p>
          </div>
          {/* Item 6 */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md text-left transition-transform transform hover:scale-105 hover:shadow-xl">
            <span className="text-5xl font-bold text-[#217AB6]">06</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Venta</h3>
            <p className="text-gray-600 leading-relaxed">Dedicamos nuestros tiempo a la venta de equipos nuevos o usados. Nos ajustamos al presupuesto del cliente.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
