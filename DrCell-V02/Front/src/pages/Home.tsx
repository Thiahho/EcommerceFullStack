import React from 'react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const servicios = [
  {
    icon: (
      <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-12 h-12 text-blue-600 mx-auto"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
    
    ),
    title: 'Módulos',
    desc: 'Reparación y cambio de pantallas y módulos en 3 horas. Garantía de 15 días.'
  },
  {
    icon: (
      <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-12 h-12 text-blue-600 mx-auto"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5ZM3.75 18h15A2.25 2.25 0 0 0 21 15.75v-6a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 1.5 9.75v6A2.25 2.25 0 0 0 3.75 18Z"
      />
    </svg>
    ),
    title: 'Baterías',
    desc: 'Cambio de baterías originales y compatibles. Garantía de 15 días.'
  },
  {
    icon: (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-12 h-12 text-blue-600 mx-auto"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>


    ),
    title: 'Pines',
    desc: 'Reparación de pines de carga y placa. Garantía de 15 días.'
  }
];

const Home: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center py-8 px-2">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-2 max-w-2xl">Reparación de Celulares en Moreno</h1>
        <p className="text-base md:text-lg text-gray-600 mb-4 max-w-xl mx-auto">
          Servicio rápido, profesional y con garantía. ¡Cotizá tu reparación online o visitanos en nuestro local!
        </p>
        <Link to="/cotizacion">
          <Button className="px-6 py-2 text-base rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow transition">Cotizar reparación</Button>
        </Link>
      </section>

      {/* Servicios */}
      <section className="py-6 bg-white">
        <div className="max-w-5xl mx-auto px-2">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {servicios.map((serv, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:scale-105 transition-transform">
                {serv.icon}
                <h3 className="mt-3 text-lg font-semibold text-gray-800">{serv.title}</h3>
                <p className="mt-1 text-gray-500 text-center text-sm">{serv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Llamada a la acción */}
      <section className="py-6 bg-blue-600 text-white text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">¿Tienes dudas? ¡Escríbenos por WhatsApp!</h2>
        <a
          href="https://wa.me/5491168152227"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-6 py-2 bg-white text-blue-600 font-semibold rounded-full shadow hover:bg-blue-100 transition"
        >
          Hablar con un experto
        </a>
      </section>
    </div>
  );
};

export default Home; 