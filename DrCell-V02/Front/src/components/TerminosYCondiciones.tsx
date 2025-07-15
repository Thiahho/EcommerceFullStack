import React from 'react';

const TerminosYCondiciones: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#17436b] to-[#217AB6] py-12 px-2 flex flex-col items-center">
      <div className="max-w-8xl w-full px-4 md:px-3">
        {/* Encabezado */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Términos y condiciones de nuestra garantía</h1>
       
        {/* Card de términos */}
        <br />
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 mb-8">
          <ol className="list-decimal list-inside space-y-2 text-gray-800 text-base md:text-lg">
            <li>
              El cliente autoriza expresamente a DrCell a realizar todas las pruebas técnicas necesarias para evaluar y diagnosticar el equipo entregado.
            </li>
            <li>
              Si durante el proceso se detectan fallas distintas a las informadas originalmente, se notificará al cliente para obtener su aprobación previa antes de continuar con trabajos adicionales o ajustes presupuestarios.
            </li>
            <li>
              La entrega del equipo se realiza contra presentación de la orden de servicio. En caso de extravío, será necesario presentar DNI. Para que un tercero retire el dispositivo, debe estar autorizado a través del número registrado en la orden.
            </li>
            <li>
            La garantía cubre únicamente fallas de fábrica del repuesto instalado.
            </li>
            <li>
            No se otorgan garantías en equipos mojados o con señales de humedad.
            </li>
            <li>
            Pasados los 15 días desde la fecha de ingreso, si el equipo no es retirado, quedará a disposición del servicio técnico, perdiendo el derecho a reclamo por equipo y/o seña. (Ley Código Civil Art. N° 872 y 873)
            </li>
            <li>
              Para hacer válida la garantía:
              <ul className="list-disc list-inside ml-6 mt-1 text-gray-700 text-sm md:text-base space-y-1">
                <li>El equipo debe mantenerse en las mismas condiciones que al momento de la entrega.</li>
                <li>No debe presentar golpes, humedad ni daños por uso indebido posterior a la reparación.</li>
                <li>Es obligatorio presentar la orden de servicio original.</li>
                <li>La garantía cubre únicamente la falla detallada en dicha orden.</li>
              </ul>
            </li>
            <li>
              DrCell no se hace responsable ante eventos fuera de su control como robos, incendios, inundaciones u otros siniestros. Al dejar el equipo, el cliente acepta estas condiciones y renuncia a reclamar compensaciones por tales situaciones.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TerminosYCondiciones;
