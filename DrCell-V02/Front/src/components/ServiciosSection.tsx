import React from 'react';
import { Wrench, Battery, Plug } from 'lucide-react';

const servicios = [
  {
    titulo: 'Módulos',
    icono: <Wrench size={50} className="text-blue-800" />,
    descripcion: 'Reparación y cambio de pantallas y módulos en 3 horas. Garantía de 15 días.'
  },
  {
    titulo: 'Baterías',
    icono: <Battery size={50} className="text-blue-800" />,
    descripcion: 'Cambio de baterías originales y compatibles. Garantía de 15 días.'
  },
  {
    titulo: 'Pines',
    icono: <Plug size={50} className="text-blue-800" />,
    descripcion: 'Reparación de pines de carga y placa. Garantía de 15 días.'
  }
];

const ServiciosSection: React.FC = () => (
  <section className="my-16">
    <h2 className="text-4xl font-bold text-center mb-4">
      Contacta con expertos
    </h2>
    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
      Nuestro equipo está listo para ayudarte con cualquier reparación de tu celular. Consulta sin compromiso.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
      {servicios.map((servicio) => (
        <div 
          key={servicio.titulo}
          className="bg-white p-6 rounded-3xl shadow-lg min-h-[200px] flex flex-col items-center text-center transition-all duration-200 hover:shadow-xl"
        >
          <div className="mb-4">
            {servicio.icono}
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">
              {servicio.titulo}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {servicio.descripcion}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ServiciosSection; 