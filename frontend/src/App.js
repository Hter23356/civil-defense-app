import { useEffect, useMemo, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Toaster, toast } from 'sonner';
import { AlertTriangle, Shield, Heart, Radio, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const regions = [
  { id: 'kyiv', name: 'Київська область' },
  { id: 'kharkiv', name: 'Харківська область' },
  { id: 'lviv', name: 'Львівська область' },
  { id: 'odesa', name: 'Одеська область' },
  { id: 'dnipro', name: 'Дніпропетровська область' },
];

const shelters = [
  { id: 's1', name: 'Метро Хрещатик', address: 'Хрещатик, 1', city: 'Київ', region: 'Київська область', latitude: 50.447, longitude: 30.522, capacity: 500, shelter_type: 'metro', description: 'Центральна станція метро у середмісті.' },
  { id: 's2', name: 'Метро Майдан Незалежності', address: 'Майдан Незалежності', city: 'Київ', region: 'Київська область', latitude: 50.45, longitude: 30.524, capacity: 600, shelter_type: 'metro', description: 'Станція метро з кількома входами.' },
  { id: 's3', name: 'Підземний паркінг Globus', address: 'Майдан Незалежності, 1', city: 'Київ', region: 'Київська область', latitude: 50.449, longitude: 30.524, capacity: 300, shelter_type: 'underground', description: 'Підземний паркінг торгового центру.' },
  { id: 's4', name: 'Метро Університет', address: 'майдан Свободи', city: 'Харків', region: 'Харківська область', latitude: 50.004, longitude: 36.232, capacity: 400, shelter_type: 'metro', description: 'Станція харківського метро.' },
  { id: 's5', name: 'Підвал школи №15', address: 'вул. Сумська, 45', city: 'Харків', region: 'Харківська область', latitude: 50.002, longitude: 36.23, capacity: 150, shelter_type: 'building', description: 'Укриття у підвальному приміщенні.' },
  { id: 's6', name: 'Підземний перехід Площа Ринок', address: 'Площа Ринок', city: 'Львів', region: 'Львівська область', latitude: 49.842, longitude: 24.032, capacity: 200, shelter_type: 'underground', description: 'Підземний перехід у центрі міста.' },
  { id: 's7', name: 'Паркінг Victoria Gardens', address: 'вул. Кульпарківська, 226А', city: 'Львів', region: 'Львівська область', latitude: 49.807, longitude: 23.978, capacity: 250, shelter_type: 'underground', description: 'Підземний паркінг торгового центру.' },
  { id: 's8', name: 'Метро Центральна', address: 'Вокзальна площа', city: 'Дніпро', region: 'Дніпропетровська область', latitude: 48.477, longitude: 35.015, capacity: 500, shelter_type: 'metro', description: 'Станція метро біля вокзалу.' },
  { id: 's9', name: 'Підвал адмінбудівлі', address: 'пр. Дмитра Яворницького, 1', city: 'Дніпро', region: 'Дніпропетровська область', latitude: 48.459, longitude: 35.039, capacity: 100, shelter_type: 'building', description: 'Укриття в адміністративній будівлі.' },
  { id: 's10', name: 'Підземний паркінг Arkadia', address: 'вул. Генуезька, 24Д', city: 'Одеса', region: 'Одеська область', latitude: 46.444, longitude: 30.755, capacity: 350, shelter_type: 'underground', description: 'Підземний паркінг торгового центру.' },
];

const alerts = [
  { id: 'a1', region: 'Київська область', alert_type: 'Повітряна тривога', start_time: '2026-05-14T09:15:00.000Z', end_time: null, is_active: true, description: 'Повітряна тривога. Пройдіть до найближчого укриття.' },
  { id: 'a2', region: 'Харківська область', alert_type: 'БПЛА', start_time: '2026-05-14T08:40:00.000Z', end_time: null, is_active: true, description: 'Зафіксовано активність БПЛА. Залишайтеся в укритті.' },
  { id: 'a3', region: 'Львівська область', alert_type: 'Відбій', start_time: '2026-05-13T21:10:00.000Z', end_time: '2026-05-13T21:45:00.000Z', is_active: false, description: 'Тривогу завершено.' },
];

const instructions = [
  { id: 'm1', category: 'bleeding', title: 'Зупинка кровотечі', steps: ['Натисніть на рану чистою тканиною або стерильною серветкою.', 'Тримайте прямий тиск 10-15 хвилин.', 'Підніміть поранену частину тіла вище рівня серця, якщо це можливо.', 'При сильній кровотечі викличте швидку допомогу за номером 103.'] },
  { id: 'm2', category: 'fracture', title: 'Перша допомога при переломах', steps: ['Не переміщуйте постраждалого без потреби.', 'Зафіксуйте ушкоджену кінцівку в тому положенні, у якому вона є.', 'Прикладіть холод через тканину.', 'Не намагайтеся вправити кістку самостійно.'] },
  { id: 'm3', category: 'burn', title: 'Допомога при опіках', steps: ['Припиніть дію джерела опіку.', 'Охолоджуйте опік прохолодною проточною водою 10-20 хвилин.', 'Не наносіть масло, крем або мазь на свіжий опік.', 'При великих опіках негайно зверніться до лікаря.'] },
  { id: 'm4', category: 'cpr', title: 'Серцево-легенева реанімація', steps: ['Перевірте свідомість і дихання.', 'Попросіть когось викликати 103.', 'Робіть 30 натискань на грудну клітку з темпом 100-120 на хвилину.', 'Продовжуйте до прибуття медиків або появи ознак життя.'] },
];

const messages = [
  { id: 't1', message_text: 'Оновлення: у застосунку доступна карта укриттів, перелік тривог та інструкції першої допомоги.', timestamp: '2026-05-14T09:00:00.000Z' },
  { id: 't2', message_text: 'Демо-режим працює без сервера та бази даних, тому сайт можна безкоштовно розмістити як статичний.', timestamp: '2026-05-14T08:30:00.000Z' },
];

const typeLabels = {
  metro: 'Метро',
  underground: 'Підземне',
  building: 'Будівля',
};

function BackButton({ testId }) {
  return (
    <Link to="/" data-testid={testId}>
      <Button variant="ghost">Назад</Button>
    </Link>
  );
}

function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const navigate = useNavigate();

  const activeAlerts = useMemo(() => {
    return alerts.filter((alert) => alert.is_active && (selectedRegion === 'all' || alert.region === selectedRegion));
  }, [selectedRegion]);

  const initSampleData = () => {
    toast.success('Демо-дані вже вбудовані в сайт');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Система цивільного захисту
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Інформація про укриття, тривоги та першу медичну допомогу
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <label className="block text-sm font-medium text-gray-700 mb-2">Оберіть ваш регіон</label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger data-testid="region-select">
              <SelectValue placeholder="Всі регіони" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі регіони</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeAlerts.length > 0 && (
          <div className="mb-12">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg" data-testid="active-alerts-section">
              <div className="flex items-start">
                <AlertTriangle className="w-8 h-8 text-red-600 mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-red-900 mb-3">Активні тривоги</h2>
                  <div className="space-y-3">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className="bg-white p-4 rounded-lg" data-testid={`alert-item-${alert.id}`}>
                        <Badge variant="destructive" className="mb-2">{alert.region}</Badge>
                        <p className="text-gray-800 font-medium">{alert.description}</p>
                        <p className="text-sm text-gray-600">Початок: {new Date(alert.start_time).toLocaleString('uk-UA')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <CardDescription>Актуальні та завершені сповіщення</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/medical')} data-testid="nav-medical">
            <CardHeader>
              <Heart className="w-12 h-12 text-green-600 mb-3" />
              <CardTitle>Перша допомога</CardTitle>
              <CardDescription>Короткі інструкції для екстрених випадків</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1" onClick={() => navigate('/telegram')} data-testid="nav-telegram">
            <CardHeader>
              <Radio className="w-12 h-12 text-purple-600 mb-3" />
              <CardTitle>Оновлення</CardTitle>
              <CardDescription>Демо-повідомлення та статус застосунку</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={initSampleData} variant="outline" data-testid="init-sample-data-btn">
            Перевірити демо-дані
          </Button>
        </div>
      </div>
    </div>
  );
}

function SheltersPage() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const filteredShelters = useMemo(() => {
    return shelters.filter((shelter) => {
      const regionMatches = selectedRegion === 'all' || shelter.region === selectedRegion;
      const cityMatches = selectedCity === 'all' || shelter.city === selectedCity;
      return regionMatches && cityMatches;
    });
  }, [selectedRegion, selectedCity]);

  const cities = useMemo(() => {
    const source = selectedRegion === 'all' ? shelters : shelters.filter((shelter) => shelter.region === selectedRegion);
    return [...new Set(source.map((shelter) => shelter.city))];
  }, [selectedRegion]);

  useEffect(() => {
    setSelectedCity('all');
  }, [selectedRegion]);

  const mapCenter = filteredShelters.length > 0 ? [filteredShelters[0].latitude, filteredShelters[0].longitude] : [50.4501, 30.5234];

  const getShelterIcon = (type) => {
    const colors = {
      metro: 'bg-blue-500',
      underground: 'bg-green-500',
      building: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton testId="back-to-home" />
        </div>
        <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Карта укриттів</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Регіон</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger data-testid="filter-region-select">
                <SelectValue placeholder="Всі регіони" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі регіони</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Місто</label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger data-testid="filter-city-select">
                <SelectValue placeholder="Всі міста" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі міста</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-8 rounded-lg overflow-hidden shadow-lg" style={{ height: '500px' }} data-testid="shelter-map">
          <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredShelters.map((shelter) => (
              <Marker key={shelter.id} position={[shelter.latitude, shelter.longitude]}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg mb-1">{shelter.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{shelter.address}</p>
                    <p className="text-sm"><strong>Місткість:</strong> {shelter.capacity} осіб</p>
                    <p className="text-sm"><strong>Тип:</strong> {typeLabels[shelter.shelter_type]}</p>
                    <p className="text-sm mt-2">{shelter.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShelters.map((shelter) => (
            <Card key={shelter.id} data-testid={`shelter-card-${shelter.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2 gap-3">
                  <CardTitle className="text-lg">{shelter.name}</CardTitle>
                  <Badge className={getShelterIcon(shelter.shelter_type)}>{typeLabels[shelter.shelter_type]}</Badge>
                </div>
                <CardDescription>{shelter.address}, {shelter.city}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Регіон:</strong> {shelter.region}</p>
                  <p className="text-sm"><strong>Місткість:</strong> {shelter.capacity} осіб</p>
                  <p className="text-sm text-gray-600 mt-2">{shelter.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsPage() {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const visibleAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const regionMatches = selectedRegion === 'all' || alert.region === selectedRegion;
      const activeMatches = !showActiveOnly || alert.is_active;
      return regionMatches && activeMatches;
    });
  }, [selectedRegion, showActiveOnly]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton testId="back-to-home-alerts" />
        </div>
        <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Повітряні тривоги</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Регіон</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger data-testid="alerts-region-select">
                <SelectValue placeholder="Всі регіони" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі регіони</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="flex items-center space-x-2 mt-8">
              <input type="checkbox" checked={showActiveOnly} onChange={(e) => setShowActiveOnly(e.target.checked)} className="w-4 h-4 text-blue-600" data-testid="active-only-checkbox" />
              <span className="text-sm font-medium text-gray-700">Тільки активні</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {visibleAlerts.map((alert) => (
            <Card key={alert.id} className={alert.is_active ? 'border-red-500 border-2' : ''} data-testid={`alert-card-${alert.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{alert.region}</CardTitle>
                      {alert.is_active ? <Badge variant="destructive" className="animate-pulse">Активна</Badge> : <Badge variant="secondary">Завершена</Badge>}
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
                  {alert.end_time && <p><strong>Завершення:</strong> {new Date(alert.end_time).toLocaleString('uk-UA')}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedicalPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { value: 'all', label: 'Всі категорії' },
    { value: 'bleeding', label: 'Кровотеча' },
    { value: 'fracture', label: 'Перелом' },
    { value: 'burn', label: 'Опік' },
    { value: 'cpr', label: 'СЛР' },
  ];

  const visibleInstructions = selectedCategory === 'all' ? instructions : instructions.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton testId="back-to-home-medical" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Heart className="w-12 h-12 text-green-600" />
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Перша медична допомога</h1>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Категорія</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="category-select">
              <SelectValue placeholder="Всі категорії" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {visibleInstructions.map((instruction, idx) => (
            <AccordionItem key={instruction.id} value={instruction.id} className="bg-white rounded-lg shadow-md border-0" data-testid={`instruction-item-${instruction.id}`}>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">{idx + 1}</div>
                  <span className="text-lg font-semibold text-left">{instruction.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3">
                  {instruction.steps.map((step, stepIdx) => (
                    <div key={step} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{stepIdx + 1}</div>
                      <p className="text-gray-700 flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function TelegramPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton testId="back-to-home-telegram" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Radio className="w-12 h-12 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Оновлення</h1>
            <p className="text-gray-600">Демо-повідомлення застосунку</p>
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} data-testid={`telegram-message-${message.id}`}>
              <CardContent className="pt-6">
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{message.message_text}</p>
                <p className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleString('uk-UA')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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
