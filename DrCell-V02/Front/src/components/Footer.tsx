import { WHATSAPP_CONFIG } from '@/config/whatsapp';
import React from 'react';
import { Link } from 'react-router-dom';
const Footer: React.FC = () => {

  const handleWhatsAppOrder = () => {
    const whatsappNumber = WHATSAPP_CONFIG.PHONE_NUMBER;
    const encodedMessage = 'Hola, quisiera hablar con DrCell... '
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  return (
    <footer className="bg-[#17436b] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Sección de contacto */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="lg:flex-1">
            <h3 className="text-xl sm:text-2xl font-semibold">
              ¿Tienes una pregunta? Comentanos por WhatsApp.
            </h3>
          </div>
          <div className="lg:text-right">
            <button onClick={handleWhatsAppOrder}  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 w-full sm:w-auto">
              Habla con nosotros/agenda una llamada →
            </button>
          </div>
        </div>

        <div className="border-t border-white/20 mb-8"></div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Columna 1 - Información de la empresa */}
          <div className="lg:col-span-1">
            <h4 className="text-3x1 text-[#217AB6] font-bold mb-4">
             <span className="text-3xl">DrCell</span> <span className="text-white">Reparacion de Celulares</span>
            </h4>
            <p className="text-white/70 text-base leading-relaxed">
              Ubicados hace 18 años en el mismo lugar, atendido por su dueño.
              <br />
              </p>
              <p className="text-white/70 text-base leading-relaxed hover:text-[#217AB6] transition duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => window.open('https://www.google.com/maps/place/Dr.+Cell/@-34.6456948,-58.7926662,17z/data=!3m1!4b1!4m6!3m5!1s0x95bc9451ecf381a7:0x3b2ca7b87e0d586c!8m2!3d-34.6456992!4d-58.7900859!16s%2Fg%2F11j8zg3616?entry=ttu&g_ep=EgoyMDI1MDYyMi4wIKXMDSoASAFQAw%3D%3D', '_blank')}>
              Libertador 362, Moreno, Buenos Aires, Argentina.
            </p>
          </div>

       
          {/* Columna 3 - Soporte */}
          <div>
            <h5 className="font-semibold text-lg mb-4">Soporte</h5>
            <ul className="space-y-2">
              
              <li>
                <a onClick={handleWhatsAppOrder} className="text-white/70 hover:text-white transition-colors duration-200 text-base">
                  Hablar con expertos
                </a>
              </li>
             
              
            </ul>
          </div>

          {/* Columna 4 - Datos generales */}
          <div>
            <h5 className="font-semibold text-lg mb-4">Datos generales</h5>
            <ul className="space-y-2">
              <li>
                <a href="./TerminosYCondiciones" className="text-white/70 hover:text-white transition-colors duration-200 text-base">
                  Condiciones
                </a>
              </li>
             
              
            </ul>
           
          </div>
        </div>

        

        <div className="border-t border-white/20 mb-6"></div>

        {/* Footer inferior */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-white/70 text-base">
              &copy; {new Date().getFullYear()} DrCell. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex justify-center mt-4">
            <img src="/img/pagos.png" alt="Medios de pago" className="max-w-xs w-full rounded-2xl shadow" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 