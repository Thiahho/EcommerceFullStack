import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Paper,
  Divider,
  Chip,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import axios from 'axios';

interface Phone {
  marca: string;
  modelo: string;
}

interface RepairQuote {
  marca: string;
  modelo: string;
  arreglomodulo?: number;
  arreglobat?: number;
  arreglopin?: number;
  colormodulo?: string;
  placa?: number;
  tipo?: string;
  tipopig?: string;
  marco?: boolean;
  version?: string;
}

const RepairQuote: React.FC = () => {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [quote, setQuote] = useState<RepairQuote | null>(null);
  const [allQuotes, setAllQuotes] = useState<RepairQuote[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<RepairQuote[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch brands
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:5015/celulares/marcas');
        setBrands(response.data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  // Buscador en tiempo real
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      setSearching(true);
      const timeoutId = setTimeout(async () => {
        try {
          const params = new URLSearchParams();
          params.append('termino', searchTerm.trim());
          
          const response = await axios.get(`http://localhost:5015/celulares/buscar?${params}`);
          const data: RepairQuote[] = response.data.data || [];
          setSearchResults(data);
        } catch (error) {
          console.error('Error searching:', error);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setSearching(false);
    }
  }, [searchTerm]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.buscador-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch models when brand changes
    if (selectedBrand) {
      const fetchModels = async () => {
        try {
          const response = await axios.get(`http://localhost:5015/celulares/modelos/${selectedBrand}`);
          setModels(response.data);
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      };
      fetchModels();
    }
  }, [selectedBrand]);

  useEffect(() => {
    // Fetch all quotes when both brand and model are selected
    if (selectedBrand && selectedModel) {
      const fetchQuotes = async () => {
        setLoading(true);
        try {
          // Usar el nuevo endpoint de búsqueda
          const params = new URLSearchParams();
          params.append('marca', selectedBrand);
          params.append('modelo', selectedModel);
          
          const response = await axios.get(`http://localhost:5015/celulares/buscar?${params}`);
          const quotes: RepairQuote[] = response.data.data || [];
          
          setAllQuotes(quotes);
          
          // Si hay múltiples registros, tomar el primero como principal
          if (quotes.length > 0) {
            setQuote(quotes[0]);
          } else {
            setQuote(null);
          }
        } catch (error) {
          console.error('Error fetching quotes:', error);
          setQuote(null);
          setAllQuotes([]);
        } finally {
          setLoading(false);
        }
      };
      fetchQuotes();
    } else {
      setQuote(null);
      setAllQuotes([]);
    }
  }, [selectedBrand, selectedModel]);

  const handleBrandChange = (event: SelectChangeEvent) => {
    setSelectedBrand(event.target.value);
    setSelectedModel('');
    setQuote(null);
    setAllQuotes([]);
  };

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  // Función para seleccionar desde la búsqueda
  const handleSelectFromSearch = (item: RepairQuote) => {
    setSelectedBrand(item.marca);
    setSelectedModel(item.modelo);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const getPriceDisplay = (price: number | undefined | null) => {
    if (price === null || price === undefined) {
      return { text: 'Sin presupuesto', color: 'error' as const };
    }
    return { text: `$${price}`, color: 'success' as const };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Cotización de Reparación
        </Typography>

        {/* Buscador en tiempo real */}
        <Box sx={{ mb: 3 }} className="buscador-container">
          <Typography variant="h6" gutterBottom>
            Buscar dispositivo
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="Escribe marca o modelo (ej: Samsung Galaxy, iPhone)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              sx={{ pr: searching ? 4 : 1 }}
            />
            {searching && (
              <CircularProgress
                size={20}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}
          </Box>
          
          {/* Dropdown con resultados de búsqueda */}
          {showDropdown && (searchResults.length > 0 || searchTerm.trim().length >= 2) && (
            <Paper sx={{ 
              position: 'absolute', 
              zIndex: 1000, 
              width: '100%', 
              mt: 1, 
              maxHeight: 300, 
              overflow: 'auto' 
            }}>
              {searchResults.length > 0 ? (
                <List>
                  {searchResults.map((item, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton onClick={() => handleSelectFromSearch(item)}>
                        <ListItemText
                          primary={`${item.marca} ${item.modelo}`}
                          secondary={
                            <Box>
                              {item.colormodulo && <Chip label={`Color: ${item.colormodulo}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                              {item.tipo && <Chip label={`Tipo: ${item.tipo}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                              {item.version && <Chip label={`Versión: ${item.version}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                              <Chip 
                                label={item.marco ? 'Con marco' : 'Sin marco'} 
                                size="small" 
                                sx={{ mr: 0.5, mb: 0.5 }} 
                              />
                              {item.arreglomodulo && <Chip label={`M:$${item.arreglomodulo}`} size="small" color="success" sx={{ mr: 0.5, mb: 0.5 }} />}
                              {item.arreglobat && <Chip label={`B:$${item.arreglobat}`} size="small" color="success" sx={{ mr: 0.5, mb: 0.5 }} />}
                              {item.arreglopin && <Chip label={`P:$${item.arreglopin}`} size="small" color="success" sx={{ mb: 0.5 }} />}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  {searching ? 'Buscando...' : `No se encontraron dispositivos con "${searchTerm}"`}
                </Box>
              )}
            </Paper>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={brands}
              inputValue={selectedBrand}
              onInputChange={(_, value) => setSelectedBrand(value)}
              renderInput={(params) => (
                <TextField {...params} label="Marca" />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={models}
              inputValue={selectedModel}
              onInputChange={(_, value) => setSelectedModel(value)}
              renderInput={(params) => (
                <TextField {...params} label="Modelo" />
              )}
            />
          </Grid>
        </Grid>

        {loading && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Consultando precios...
          </Alert>
        )}

        {/* Cotización Principal */}
        {quote && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cotización Principal para {quote.marca} {quote.modelo}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {quote.arreglomodulo && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Reparación de Módulo: <Chip 
                      label={getPriceDisplay(quote.arreglomodulo).text} 
                      color={getPriceDisplay(quote.arreglomodulo).color} 
                      size="small" 
                    />
                  </Typography>
                </Grid>
              )}
              {quote.arreglobat && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Cambio de Batería: <Chip 
                      label={getPriceDisplay(quote.arreglobat).text} 
                      color={getPriceDisplay(quote.arreglobat).color} 
                      size="small" 
                    />
                  </Typography>
                </Grid>
              )}
              {quote.arreglopin && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    Reparación de Pin de Carga: <Chip 
                      label={getPriceDisplay(quote.arreglopin).text} 
                      color={getPriceDisplay(quote.arreglopin).color} 
                      size="small" 
                    />
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Todas las variantes disponibles */}
        {allQuotes.length > 1 && (
          <Paper sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Todas las variantes disponibles ({allQuotes.length})
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {allQuotes.map((quoteItem, index) => (
                <Grid item xs={12} key={index}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {quoteItem.marca} {quoteItem.modelo}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {quoteItem.colormodulo && <Chip label={`Color: ${quoteItem.colormodulo}`} size="small" />}
                      {quoteItem.tipo && <Chip label={`Tipo: ${quoteItem.tipo}`} size="small" />}
                      {quoteItem.version && <Chip label={`Versión: ${quoteItem.version}`} size="small" />}
                      <Chip label={quoteItem.marco ? 'Con marco' : 'Sin marco'} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {quoteItem.arreglomodulo && (
                        <Chip 
                          label={`Módulo: ${getPriceDisplay(quoteItem.arreglomodulo).text}`} 
                          color={getPriceDisplay(quoteItem.arreglomodulo).color} 
                          size="small" 
                        />
                      )}
                      {quoteItem.arreglobat && (
                        <Chip 
                          label={`Batería: ${getPriceDisplay(quoteItem.arreglobat).text}`} 
                          color={getPriceDisplay(quoteItem.arreglobat).color} 
                          size="small" 
                        />
                      )}
                      {quoteItem.arreglopin && (
                        <Chip 
                          label={`Pin: ${getPriceDisplay(quoteItem.arreglopin).text}`} 
                          color={getPriceDisplay(quoteItem.arreglopin).color} 
                          size="small" 
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default RepairQuote; 