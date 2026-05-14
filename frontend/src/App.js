import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Toaster, toast } from 'sonner';
import { AlertTriangle, Shield, Heart, Radio, Menu, X, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function HomePage() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // Auto refresh alerts every 30 seconds
    const interval = setInterval(() => {
      loadAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedRegion && selectedRegion !== 'all') {
      loadAlerts();
    } else if (selectedRegion === 'all') {
      loadAlerts();
    }
  }, [selectedRegion]);

  const loadData = async () => {
    try {
      const [regionsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/regions`),
        axios.get(`${API}/alerts?active_only=true`)
      ]);
      setRegions(regionsRes.data);
      setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const query = (selectedRegion && selectedRegion !== 'all') ? `?region=${selectedRegion}&active_only=true` : '?active_only=true';
      const res = await axios.get(`${API}/alerts${query}`);
      setAlerts(res.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const initSampleData = async () => {
    try {
      await axios.post(`${API}/init-sample-data`);
      toast.success('Тестові дані ініціалізовано');
      loadData();
    } catch (error) {
      toast.error('Помилка ініціалізації даних');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-xl font-semibold">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Система цивільного захисту
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Інформація про укриття, тривоги та перша медична допомога
          </p>
        </div>

        {/* Region Selector */}
        <div className="max-w-md mx-auto mb-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">Оберіть ваш регіон</label>
          <Select value={selectedRegion || undefined} onValueChange={setSelectedRegion}>
            <SelectTrigger data-testid="region-select">
              <SelectValue placeholder="Всі регіони" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі регіони</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="mb-12">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg" data-testid="active-alerts-section">
              <div className="flex items-start">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-red-900 mb-3">Активні тривоги</h2>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="bg-white p-4 rounded-lg" data-testid={`alert-item-${alert.id}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="destructive" className="mb-2">{alert.region}</Badge>
                            <p className="text-gray-800 font-medium">{alert.description}</p>
                            <p className="text-sm text-gray-600">Початок: {new Date(alert.start_time).toLocaleString('uk-UA')}</p>
                          </div>
                          <div className="animate-pulse">
                            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/shelters')} data-testid="nav-shelters">
            <CardHeader>
              <MapPin className="w-12 h-12 text-blue-600 mb-3" />
              <CardTitle>Укриття</CardTitle>
              <CardDescription>Карта укриттів у вашому регіоні</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/alerts')} data-testid="nav-alerts">
            <CardHeader>
              <AlertTriangle className="w-12 h-12 text-red-600 mb-3" />
              <CardTitle>Тривоги</CardTitle>
              <CardDescription>Активні повітряні тривоги</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/medical')} data-testid="nav-medical">
            <CardHeader>
              <Heart className="w-12 h-12 text-green-600 mb-3" />
              <CardTitle>Перша допомога</CardTitle>
              <CardDescription>Інструкції першої медичної допомоги</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/telegram')} data-testid="nav-telegram">
            <CardHeader>
              <Radio className="w-12 h-12 text-purple-600 mb-3" />
              <CardTitle>Новини ПС ЗСУ</CardTitle>
              <CardDescription>Оновлення з офіційного каналу</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Init Data Button (for demo) */}
        <div className="text-center">
          <Button onClick={initSampleData} variant="outline" data-testid="init-sample-data-btn">
            Ініціалізувати тестові дані
          </Button>
        </div>
      </div>
    </div>
  );
}

function SheltersPage() {
  const [shelters, setShelters] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [cities, setCities] = useState([]);
  const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]); // Kyiv

  useEffect(() => {
    loadRegions();
    loadShelters();
  }, []);

  useEffect(() => {
    loadShelters();
  }, [selectedRegion, selectedCity]);

  useEffect(() => {
    // Extract unique cities from shelters
    const uniqueCities = [...new Set(shelters.map(s => s.city))];
    setCities(uniqueCities);
  }, [shelters]);

  const loadRegions = async () => {
    try {
      const res = await axios.get(`${API}/regions`);
      setRegions(res.data);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const loadShelters = async () => {
    try {
      let query = '';
      if (selectedRegion && selectedRegion !== 'all') query += `?region=${selectedRegion}`;
      if (selectedCity && selectedCity !== 'all') query += query ? `&city=${selectedCity}` : `?city=${selectedCity}`;
      const res = await axios.get(`${API}/shelters${query}`);
      setShelters(res.data);
      if (res.data.length > 0) {
        setMapCenter([res.data[0].latitude, res.data[0].longitude]);
      }
    } catch (error) {
      console.error('Error loading shelters:', error);
      toast.error('Помилка завантаження укриттів');
    }
  };

  const getShelterIcon = (type) => {
    const colors = {
      metro: 'bg-blue-500',
      underground: 'bg-green-500',
      building: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" data-testid="back-to-home">
            <Button variant="ghost">← Назад</Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Карта укриттів</h1>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Регіон</label>
            <Select value={selectedRegion || undefined} onValueChange={setSelectedRegion}>
              <SelectTrigger data-testid="filter-region-select">
                <SelectValue placeholder="Всі регіони" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі регіони</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Місто</label>
            <Select value={selectedCity || undefined} onValueChange={setSelectedCity}>
              <SelectTrigger data-testid="filter-city-select">
                <SelectValue placeholder="Всі міста" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі міста</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Map */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg" style={{ height: '500px' }} data-testid="shelter-map">
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {shelters.map((shelter) => (
              <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{shelter.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{shelter.address}</p>
                    <p className="text-sm"><strong>Місткість:</strong> {shelter.capacity} осіб</p>
                    <p className="text-sm"><strong>Тип:</strong> {shelter.shelter_type}</p>
                    {shelter.description && <p className="text-sm mt-2">{shelter.description}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Shelters List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shelters.map((shelter) => (
            <Card key={shelter.id} data-testid={`shelter-card-${shelter.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{shelter.name}</CardTitle>
                  <Badge className={getShelterIcon(shelter.shelter_type)}>
                    {shelter.shelter_type}
                  </Badge>
                </div>
                <CardDescription>{shelter.address}, {shelter.city}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Регіон:</strong> {shelter.region}</p>
                  <p className="text-sm"><strong>Місткість:</strong> {shelter.capacity} осіб</p>
                  {shelter.description && (
                    <p className="text-sm text-gray-600 mt-2">{shelter.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {shelters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Укриттів не знайдено. Спробуйте змінити фільтри.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    loadRegions();
    loadAlerts();
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [selectedRegion, showActiveOnly]);

  const loadRegions = async () => {
    try {
      const res = await axios.get(`${API}/regions`);
      setRegions(res.data);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      let query = `?active_only=${showActiveOnly}`;
      if (selectedRegion && selectedRegion !== 'all') query += `&region=${selectedRegion}`;
      const res = await axios.get(`${API}/alerts${query}`);
      setAlerts(res.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast.error('Помилка завантаження тривог');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" data-testid="back-to-home-alerts">
            <Button variant="ghost">← Назад</Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Повітряні тривоги</h1>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Регіон</label>
            <Select value={selectedRegion || undefined} onValueChange={setSelectedRegion}>
              <SelectTrigger data-testid="alerts-region-select">
                <SelectValue placeholder="Всі регіони" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі регіони</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="flex items-center space-x-2 mt-8">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600"
                data-testid="active-only-checkbox"
              />
              <span className="text-sm font-medium text-gray-700">Тільки активні</span>
            </label>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={alert.is_active ? 'border-red-500 border-2' : ''} data-testid={`alert-card-${alert.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{alert.region}</CardTitle>
                      {alert.is_active ? (
                        <Badge variant="destructive" className="animate-pulse">Активна</Badge>
                      ) : (
                        <Badge variant="secondary">Завершена</Badge>
                      )}
                    </div>
                    <CardDescription>{alert.description}</CardDescription>
                  </div>
                  {alert.is_active && <AlertTriangle className="w-8 h-8 text-red-600" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p><strong>Тип:</strong> {alert.alert_type}</p>
                  <p><strong>Початок:</strong> {new Date(alert.start_time).toLocaleString('uk-UA')}</p>
                  {alert.end_time && (
                    <p><strong>Закінчення:</strong> {new Date(alert.end_time).toLocaleString('uk-UA')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Тривог не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MedicalPage() {
  const [instructions, setInstructions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadInstructions();
  }, [selectedCategory]);

  const loadInstructions = async () => {
    try {
      const query = (selectedCategory && selectedCategory !== 'all') ? `?category=${selectedCategory}` : '';
      const res = await axios.get(`${API}/medical-instructions${query}`);
      setInstructions(res.data);
    } catch (error) {
      console.error('Error loading instructions:', error);
      toast.error('Помилка завантаження інструкцій');
    }
  };

  const categories = [
    { value: 'all', label: 'Всі категорії' },
    { value: 'bleeding', label: 'Кровотеча' },
    { value: 'fracture', label: 'Перелом' },
    { value: 'burn', label: 'Опік' },
    { value: 'cpr', label: 'СЛР' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" data-testid="back-to-home-medical">
            <Button variant="ghost">← Назад</Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Heart className="w-12 h-12 text-green-600" />
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Перша медична допомога</h1>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Категорія</label>
          <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="category-select">
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Instructions */}
        <Accordion type="single" collapsible className="space-y-4">
          {instructions.map((instruction, idx) => (
            <AccordionItem key={instruction.id} value={instruction.id} className="bg-white rounded-lg shadow-md border-0" data-testid={`instruction-item-${instruction.id}`}>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-lg font-semibold text-left">{instruction.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3">
                  {instruction.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {stepIdx + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {instructions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Інструкцій не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TelegramPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await axios.get(`${API}/telegram-messages?limit=20`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Помилка завантаження повідомлень');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" data-testid="back-to-home-telegram">
            <Button variant="ghost">← Назад</Button>
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Radio className="w-12 h-12 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Новини ПС ЗСУ</h1>
            <p className="text-gray-600">Офіційний канал @kpszsu</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} data-testid={`telegram-message-${message.id}`}>
              <CardContent className="pt-6">
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{message.message_text}</p>
                <p className="text-sm text-gray-500">
                  {new Date(message.timestamp).toLocaleString('uk-UA')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Повідомлень поки немає</p>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shelters" element={<SheltersPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/medical" element={<MedicalPage />} />
          <Route path="/telegram" element={<TelegramPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;