import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { WHATSAPP_CONFIG } from '../config/whatsapp';

interface ReparacionInfo {
  arreglomodulo?: number;
  arreglobat?: number;
  arreglopin?: number;
  colormodulo?: string;
  tipo?: string;
  marco?: boolean;
  version?: string;
  placa?: number;
  id?: number;
  marca?: string;
  modelo?: string;
}

const API_URL = 'http://localhost:5015';

const ConsultaReparacionSection: React.FC = () => {
  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelos, setModelos] = useState<string[]>([]);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [variantes, setVariantes] = useState<ReparacionInfo[]>([]);
  const [color, setColor] = useState('');
  const [marco, setMarco] = useState('');
  const [version, setVersion] = useState('');
  const [tipo, setTipo] = useState('');
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<ReparacionInfo | null>(null);
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [todosLosRegistros, setTodosLosRegistros] = useState<ReparacionInfo[]>([]);
  
  // Nuevos estados para el buscador
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<ReparacionInfo[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  const [marcaInput, setMarcaInput] = useState('');
  const [modeloInput, setModeloInput] = useState('');
  const [showMarcaDropdown, setShowMarcaDropdown] = useState(false);
  const [showModeloDropdown, setShowModeloDropdown] = useState(false);

  const marcaInputRef = useRef(null);
  const modeloInputRef = useRef(null);

  // Filtrado dinámico
  const marcasFiltradas = useMemo(
    () => marcas.filter(m => m.toLowerCase().includes(marcaInput.toLowerCase())),
    [marcas, marcaInput]
  );
  const modelosFiltrados = useMemo(
    () => modelos.filter(m => m.toLowerCase().includes(modeloInput.toLowerCase())),
    [modelos, modeloInput]
  );

  // Obtener marcas reales
  useEffect(() => {
    axios.get(`${API_URL}/celulares/marcas`)
      .then(res => {
        // Eliminar duplicados manteniendo formato original
        const marcasUnicas = Array.from(new Set(
          (res.data as string[]).map((marca: string) => 
            marca.trim()  // Solo quitar espacios, mantener formato original
          )
        )).sort();
        setMarcas(marcasUnicas);
      })
      .catch(() => setMarcas([]));
  }, []);

  // Buscador en tiempo real
  useEffect(() => {
    if (terminoBusqueda.trim().length >= 2) {
      setBuscando(true);
      const timeoutId = setTimeout(() => {
        const params = new URLSearchParams();
        params.append('termino', terminoBusqueda.trim());
        
        axios.get(`${API_URL}/celulares/buscar?${params}`)
          .then(res => {
            const data: ReparacionInfo[] = res.data.data || [];
            setResultadosBusqueda(data);
          })
          .catch(() => {
            setResultadosBusqueda([]);
          })
          .finally(() => setBuscando(false));
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setResultadosBusqueda([]);
      setBuscando(false);
    }
  }, [terminoBusqueda]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.buscador-container')) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener modelos según marca
  useEffect(() => {
    setModelo('');
    setVariantes([]);
    setColor('');
    setMarco('');
    setVersion('');
    setTipo('');
    setVarianteSeleccionada(null);
    setPrecio('');
    setTodosLosRegistros([]);
    if (marca) {
      axios.get(`${API_URL}/celulares/modelos/${marca}`)
        .then(res => setModelos(res.data))
        .catch(() => setModelos([]));
    } else {
      setModelos([]);
    }
  }, [marca]);

  // Obtener todos los registros según marca y modelo usando la nueva funcionalidad
  useEffect(() => {
    setVariantes([]);
    setColor('');
    setMarco('');
    setVersion('');
    setTipo('');
    setVarianteSeleccionada(null);
    setPrecio('');
    setTodosLosRegistros([]);
    
    if (marca && modelo) {
      setLoading(true);
      
      // Usar el nuevo endpoint de búsqueda
      const params = new URLSearchParams();
      params.append('marca', marca);
      params.append('modelo', modelo);
      
      axios.get(`${API_URL}/celulares/buscar?${params}`)
        .then(res => {
          const data: ReparacionInfo[] = res.data.data || [];
          setTodosLosRegistros(data);
          setVariantes(data);
        })
        .catch(() => {
          setTodosLosRegistros([]);
          setVariantes([]);
        })
        .finally(() => setLoading(false));
    }
  }, [marca, modelo]);

  // Opciones únicas para cada campo, filtradas según las selecciones actuales
  const coloresDisponibles = useMemo(() => {
    const set = new Set(
      todosLosRegistros
        .filter(v =>
          (!marco || (v.marco ? 'Con marco' : 'Sin marco') === marco) &&
          (!version || v.version === version) &&
          (!tipo || v.tipo === tipo)
        )
        .map(v => v.colormodulo)
        .filter(Boolean)
    );
    return Array.from(set) as string[];
  }, [todosLosRegistros, marco, version, tipo]);

  const marcosDisponibles = useMemo(() => {
    const set = new Set(
      todosLosRegistros
        .filter(v =>
          (!color || v.colormodulo === color) &&
          (!version || v.version === version) &&
          (!tipo || v.tipo === tipo)
        )
        .map(v => (v.marco ? 'Con marco' : 'Sin marco'))
    );
    return Array.from(set) as string[];
  }, [todosLosRegistros, color, version, tipo]);

  const versionesDisponibles = useMemo(() => {
    const set = new Set(
      todosLosRegistros
        .filter(v =>
          (!color || v.colormodulo === color) &&
          (!marco || (v.marco ? 'Con marco' : 'Sin marco') === marco) &&
          (!tipo || v.tipo === tipo)
        )
        .map(v => v.version)
        .filter(Boolean)
    );
    return Array.from(set) as string[];
  }, [todosLosRegistros, color, marco, tipo]);

  const tiposDisponibles = useMemo(() => {
    const set = new Set(
      todosLosRegistros
        .filter(v =>
          (!color || v.colormodulo === color) &&
          (!marco || (v.marco ? 'Con marco' : 'Sin marco') === marco) &&
          (!version || v.version === version)
        )
        .map(v => v.tipo)
        .filter(Boolean)
    );
    return Array.from(set) as string[];
  }, [todosLosRegistros, color, marco, version]);

  // Buscar la variante exacta
  useEffect(() => {
    if (!color && coloresDisponibles.length > 0) return setVarianteSeleccionada(null);
    if (!marco && marcosDisponibles.length > 0) return setVarianteSeleccionada(null);
    if (!version && versionesDisponibles.length > 0) return setVarianteSeleccionada(null);
    if (!tipo && tiposDisponibles.length > 0) return setVarianteSeleccionada(null);
    
    const variante = todosLosRegistros.find(v =>
      (coloresDisponibles.length === 0 || v.colormodulo === color) &&
      (marcosDisponibles.length === 0 || (v.marco ? 'Con marco' : 'Sin marco') === marco) &&
      (versionesDisponibles.length === 0 || v.version === version) &&
      (tiposDisponibles.length === 0 || v.tipo === tipo)
    );
    setVarianteSeleccionada(variante || null);
  }, [color, marco, version, tipo, todosLosRegistros, coloresDisponibles, marcosDisponibles, versionesDisponibles, tiposDisponibles]);

  // Actualizar precio cuando cambia la variante seleccionada
  useEffect(() => {
    if (varianteSeleccionada) {
      const servicios = [];
      if (varianteSeleccionada.arreglomodulo) servicios.push(`Módulo: $${varianteSeleccionada.arreglomodulo}`);
      if (varianteSeleccionada.arreglobat) servicios.push(`Batería: $${varianteSeleccionada.arreglobat}`);
      if (varianteSeleccionada.arreglopin) servicios.push(`Pin: $${varianteSeleccionada.arreglopin}`);
      
      if (servicios.length > 0) {
        setPrecio(servicios.join(' | '));
      } else {
        setPrecio('Sin presupuesto disponible');
      }
    } else {
      setPrecio('');
    }
  }, [varianteSeleccionada]);

  const handleConsultar = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Función para seleccionar desde la búsqueda
  const handleSeleccionarBusqueda = (item: ReparacionInfo) => {
    setMarca(item.marca || '');
    setModelo(item.modelo || '');
    setTerminoBusqueda('');
    setResultadosBusqueda([]);
    setMostrarDropdown(false);
  };

  // Función para obtener el valor o mensaje de "Sin presupuesto"
  const getPrecioOMensaje = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return 'Sin presupuesto';
    }
    return `$${precio}`;
  };

  // Función para obtener la clase CSS según si hay precio o no
  const getPrecioClass = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return 'text-red-600 font-semibold bg-red-50 border-red-200';
    }
    return 'text-green-600 font-semibold bg-green-50 border-green-200';
  };

  // Función para obtener el icono según si hay precio o no
  const getPrecioIcon = (precio: number | undefined | null) => {
    if (precio === null || precio === undefined) {
      return '⚠️';
    }
    return '✅';
  };

  // Función para enviar cotización por WhatsApp
  const handleEnviarWhatsApp = () => {
    if (!varianteSeleccionada) {
      alert('Por favor selecciona un dispositivo primero');
      return;
    }

    // Construir el mensaje de WhatsApp
    let mensaje = `🔧 *- ${WHATSAPP_CONFIG.COMPANY_NAME}*\n\n`;
    mensaje += `📱 *Dispositivo:* ${varianteSeleccionada.marca} ${varianteSeleccionada.modelo}\n`;
    
    if (varianteSeleccionada.colormodulo) {
      mensaje += `🎨 *Color:* ${varianteSeleccionada.colormodulo}\n`;
    }
    if (varianteSeleccionada.tipo) {
      mensaje += `📋 *Tipo:* ${varianteSeleccionada.tipo}\n`;
    }
    if (varianteSeleccionada.version) {
      mensaje += `📱 *Versión:* ${varianteSeleccionada.version}\n`;
    }
    mensaje += `🖼️ *Marco:* ${varianteSeleccionada.marco ? 'Con marco' : 'Sin marco'}\n\n`;
    
    mensaje += `💰 *Precios de Servicios:*\n`;
    if (varianteSeleccionada.arreglomodulo) {
      mensaje += `• Módulo: $${varianteSeleccionada.arreglomodulo}\n`;
    }
    if (varianteSeleccionada.arreglobat) {
      mensaje += `• Batería: $${varianteSeleccionada.arreglobat}\n`;
    }
    if (varianteSeleccionada.arreglopin) {
      mensaje += `• Pin de carga: $${varianteSeleccionada.arreglopin}\n`;
    }
    
    if (!varianteSeleccionada.arreglomodulo && !varianteSeleccionada.arreglobat && !varianteSeleccionada.arreglopin) {
      mensaje += `• Sin presupuesto disponible\n`;
    }
    

    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Construir la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Consulta tu reparación</h2>
      
      {/* Buscador en tiempo real */}
      <div className="mb-6 buscador-container">
        {/* Dropdown con resultados de búsqueda */}
        {mostrarDropdown && (resultadosBusqueda.length > 0 || terminoBusqueda.trim().length >= 2) && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {resultadosBusqueda.length > 0 ? (
              resultadosBusqueda.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSeleccionarBusqueda(item)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.marca} {item.modelo}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.colormodulo && <span className="mr-2">Color: {item.colormodulo}</span>}
                        {item.tipo && <span className="mr-2">Tipo: {item.tipo}</span>}
                        {item.version && <span className="mr-2">Versión: {item.version}</span>}
                        <span>{item.marco ? 'Con marco' : 'Sin marco'}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.arreglomodulo && <span className="text-green-600 mr-1">M:${item.arreglomodulo}</span>}
                      {item.arreglobat && <span className="text-green-600 mr-1">B:${item.arreglobat}</span>}
                      {item.arreglopin && <span className="text-green-600">P:${item.arreglopin}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                {buscando ? 'Buscando...' : `No se encontraron dispositivos con "${terminoBusqueda}"`}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleConsultar} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
            <div className="relative">
              <Input
                ref={marcaInputRef}
                placeholder="Selecciona o busca marca"
                value={marcaInput}
                onChange={e => {
                  setMarcaInput(e.target.value);
                  setShowMarcaDropdown(true);
                }}
                onFocus={() => setShowMarcaDropdown(true)}
                onBlur={() => setTimeout(() => setShowMarcaDropdown(false), 150)}
              />
              {showMarcaDropdown && (
                <div className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                  {marcasFiltradas.map(m => (
                    <div
                      key={m}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onMouseDown={() => {
                        setMarca(m);
                        setMarcaInput(m);
                        setShowMarcaDropdown(false);
                      }}
                    >
                      {m}
                    </div>
                  ))}
                  {marcasFiltradas.length === 0 && (
                    <div className="p-2 text-gray-400">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo</label>
            <div className="relative">
              <Input
                ref={modeloInputRef}
                placeholder="Selecciona o busca modelo"
                value={modeloInput}
                onChange={e => {
                  setModeloInput(e.target.value);
                  setShowModeloDropdown(true);
                }}
                onFocus={() => setShowModeloDropdown(true)}
                onBlur={() => setTimeout(() => setShowModeloDropdown(false), 150)}
              />
              {showModeloDropdown && (
                <div className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                  {modelosFiltrados.map(m => (
                    <div
                      key={m}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onMouseDown={() => {
                        setModelo(m);
                        setModeloInput(m);
                        setShowModeloDropdown(false);
                      }}
                    >
                      {m}
                    </div>
                  ))}
                  {modelosFiltrados.length === 0 && (
                    <div className="p-2 text-gray-400">Sin resultados</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {coloresDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona color" />
                </SelectTrigger>
                <SelectContent>
                  {coloresDisponibles.map((c, idx) => (
                    <SelectItem key={idx} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {marcosDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Marco</label>
              <Select value={marco} onValueChange={setMarco}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona marco" />
                </SelectTrigger>
                <SelectContent>
                  {marcosDisponibles.map((m, idx) => (
                    <SelectItem key={idx} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {versionesDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Versión</label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona versión" />
                </SelectTrigger>
                <SelectContent>
                  {versionesDisponibles.map((v, idx) => (
                    <SelectItem key={idx} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {tiposDisponibles.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDisponibles.map((t, idx) => (
                    <SelectItem key={idx} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Sección de precios de servicios */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Precios de servicios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Módulo</label>
                <span className="text-lg">{getPrecioIcon(varianteSeleccionada?.arreglomodulo)}</span>
              </div>
              <div className={`text-center py-2 px-3 rounded-md border ${getPrecioClass(varianteSeleccionada?.arreglomodulo)}`}>
                {getPrecioOMensaje(varianteSeleccionada?.arreglomodulo)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Pin de carga</label>
                <span className="text-lg">{getPrecioIcon(varianteSeleccionada?.arreglopin)}</span>
              </div>
              <div className={`text-center py-2 px-3 rounded-md border ${getPrecioClass(varianteSeleccionada?.arreglopin)}`}>
                {getPrecioOMensaje(varianteSeleccionada?.arreglopin)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Batería</label>
                <span className="text-lg">{getPrecioIcon(varianteSeleccionada?.arreglobat)}</span>
              </div>
              <div className={`text-center py-2 px-3 rounded-md border ${getPrecioClass(varianteSeleccionada?.arreglobat)}`}>
                {getPrecioOMensaje(varianteSeleccionada?.arreglobat)}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen total */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Resumen de servicios</h3>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Servicios disponibles</p>
              <p className="text-lg font-bold text-blue-600">{precio || 'Selecciona marca y modelo'}</p>
            </div>
          </div>
          {loading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-blue-600">Consultando precios...</p>
            </div>
          )}
        </div>

        {/* Botón de WhatsApp */}
        {varianteSeleccionada && (
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">¿Te interesa esta cotización?</h3>
            <p className="text-sm text-green-700 mb-4">
              Envía la cotización por WhatsApp para consultar disponibilidad y agendar tu reparación
            </p>
            <Button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="w-full py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <span>📱</span>
              Enviar cotización por WhatsApp
            </Button>
          </div>
        )}

      </form>
    </div>
  );
};

export default ConsultaReparacionSection; 