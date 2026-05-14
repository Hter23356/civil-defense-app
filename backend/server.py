from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
from telegram import Bot

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Telegram Bot (optional if token is provided)
telegram_token = os.environ.get('TELEGRAM_TOKEN', '')
bot = Bot(token=telegram_token) if telegram_token else None

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =========================
# Models
# =========================

class Region(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_en: str

class Shelter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    city: str
    region: str
    latitude: float
    longitude: float
    capacity: int
    shelter_type: str  # "metro", "underground", "building"
    description: Optional[str] = None

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    region: str
    alert_type: str  # "air_raid", "missile", "drone"
    start_time: str
    end_time: Optional[str] = None
    is_active: bool = True
    description: Optional[str] = None

class MedicalInstruction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # "bleeding", "fracture", "burn", "cpr"
    title: str
    steps: List[str]
    image_url: Optional[str] = None

class TelegramMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message_text: str
    timestamp: str
    channel_name: str = "kpszsu"

# =========================
# API Endpoints
# =========================

@api_router.get("/")
async def root():
    return {"message": "ЄППО API - Система цивільного захисту"}

# Regions
@api_router.get("/regions", response_model=List[Region])
async def get_regions():
    regions = await db.regions.find({}, {"_id": 0}).to_list(100)
    return regions

# Shelters
@api_router.get("/shelters", response_model=List[Shelter])
async def get_shelters(region: Optional[str] = None, city: Optional[str] = None):
    query = {}
    if region:
        query["region"] = region
    if city:
        query["city"] = city
    shelters = await db.shelters.find(query, {"_id": 0}).to_list(1000)
    return shelters

@api_router.get("/shelters/{shelter_id}", response_model=Shelter)
async def get_shelter(shelter_id: str):
    shelter = await db.shelters.find_one({"id": shelter_id}, {"_id": 0})
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return shelter

# Alerts
@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(region: Optional[str] = None, active_only: bool = True):
    query = {}
    if region:
        query["region"] = region
    if active_only:
        query["is_active"] = True
    alerts = await db.alerts.find(query, {"_id": 0}).to_list(1000)
    return alerts

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert: Alert):
    alert_dict = alert.model_dump()
    await db.alerts.insert_one(alert_dict)
    return alert

@api_router.patch("/alerts/{alert_id}/deactivate")
async def deactivate_alert(alert_id: str):
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"is_active": False, "end_time": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True}

# Medical Instructions
@api_router.get("/medical-instructions", response_model=List[MedicalInstruction])
async def get_medical_instructions(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    instructions = await db.medical_instructions.find(query, {"_id": 0}).to_list(100)
    return instructions

@api_router.get("/medical-instructions/{instruction_id}", response_model=MedicalInstruction)
async def get_medical_instruction(instruction_id: str):
    instruction = await db.medical_instructions.find_one({"id": instruction_id}, {"_id": 0})
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    return instruction

# Telegram Messages
@api_router.get("/telegram-messages", response_model=List[TelegramMessage])
async def get_telegram_messages(limit: int = 20):
    messages = await db.telegram_messages.find({}, {"_id": 0}).sort("timestamp", -1).to_list(limit)
    return messages

@api_router.post("/telegram-messages", response_model=TelegramMessage)
async def create_telegram_message(message: TelegramMessage):
    message_dict = message.model_dump()
    await db.telegram_messages.insert_one(message_dict)
    return message

# Initialize sample data
@api_router.post("/init-sample-data")
async def init_sample_data():
    # Check if data already exists
    regions_count = await db.regions.count_documents({})
    if regions_count > 0:
        return {"message": "Sample data already exists"}
    
    # Regions
    regions = [
        {"id": str(uuid.uuid4()), "name": "Київська область", "name_en": "Kyiv"},
        {"id": str(uuid.uuid4()), "name": "Харківська область", "name_en": "Kharkiv"},
        {"id": str(uuid.uuid4()), "name": "Львівська область", "name_en": "Lviv"},
        {"id": str(uuid.uuid4()), "name": "Одеська область", "name_en": "Odesa"},
        {"id": str(uuid.uuid4()), "name": "Дніпропетровська область", "name_en": "Dnipro"},
    ]
    await db.regions.insert_many(regions)
    
    # Shelters
    shelters = [
        {"id": str(uuid.uuid4()), "name": "Метро Хрещатик", "address": "Хрещатик, 1", "city": "Київ", "region": "Київська область", "latitude": 50.4501, "longitude": 30.5234, "capacity": 500, "shelter_type": "metro", "description": "Центральна станція метро"},
        {"id": str(uuid.uuid4()), "name": "Метро Майдан Незалежності", "address": "Майдан Незалежності", "city": "Київ", "region": "Київська область", "latitude": 50.4504, "longitude": 30.5245, "capacity": 600, "shelter_type": "metro", "description": "Станція метро в центрі міста"},
        {"id": str(uuid.uuid4()), "name": "Підземний паркінг ТРЦ Globus", "address": "пр. Перемоги, 1", "city": "Київ", "region": "Київська область", "latitude": 50.4406, "longitude": 30.5169, "capacity": 300, "shelter_type": "underground", "description": "Підземний паркінг торгового центру"},
        {"id": str(uuid.uuid4()), "name": "Метро Університет", "address": "бул. Шевченка", "city": "Харків", "region": "Харківська область", "latitude": 50.0023, "longitude": 36.2292, "capacity": 400, "shelter_type": "metro", "description": "Станція харківського метро"},
        {"id": str(uuid.uuid4()), "name": "Підвал школи №15", "address": "вул. Сумська, 45", "city": "Харків", "region": "Харківська область", "latitude": 50.0047, "longitude": 36.2311, "capacity": 150, "shelter_type": "building", "description": "Укриття в підвалі школи"},
        {"id": str(uuid.uuid4()), "name": "Підземний перехід Площа Ринок", "address": "Площа Ринок", "city": "Львів", "region": "Львівська область", "latitude": 49.8419, "longitude": 24.0315, "capacity": 200, "shelter_type": "underground", "description": "Підземний перехід у центрі"},
        {"id": str(uuid.uuid4()), "name": "Паркінг ТРЦ Victoria Gardens", "address": "вул. Городоцька, 100", "city": "Львів", "region": "Львівська область", "latitude": 49.8237, "longitude": 24.0077, "capacity": 250, "shelter_type": "underground", "description": "Підземний паркінг"},
        {"id": str(uuid.uuid4()), "name": "Метро Центральна", "address": "Привокзальна площа", "city": "Дніпро", "region": "Дніпропетровська область", "latitude": 48.4647, "longitude": 35.0462, "capacity": 500, "shelter_type": "metro", "description": "Станція метро"},
        {"id": str(uuid.uuid4()), "name": "Підвал адмінбудівлі", "address": "пр. Дмитра Яворницького, 1", "city": "Дніпро", "region": "Дніпропетровська область", "latitude": 48.4593, "longitude": 35.0393, "capacity": 100, "shelter_type": "building", "description": "Укриття в підвалі"},
        {"id": str(uuid.uuid4()), "name": "Підземний паркінг Arkadia", "address": "Генуезька вул., 24Д", "city": "Одеса", "region": "Одеська область", "latitude": 46.4449, "longitude": 30.7546, "capacity": 350, "shelter_type": "underground", "description": "Паркінг торгового центру"},
    ]
    await db.shelters.insert_many(shelters)
    
    # Medical Instructions
    instructions = [
        {
            "id": str(uuid.uuid4()),
            "category": "bleeding",
            "title": "Зупинка кровотечі",
            "steps": [
                "Негайно притисніть рану чистою тканиною або стерильною серветкою",
                "Прикладіть тиск безпосередньо на рану протягом 10-15 хвилин",
                "Якщо кров просочується, накладіть ще один шар тканини поверх",
                "Піднесіть поранену частину тіла вище рівня серця",
                "Не знімайте перші шари тканини, щоб не порушити згусток",
                "При сильній кровотечі накладіть джгут вище рани (тільки в крайніх випадках)",
                "Викличте швидку допомогу або доставте постраждалого до лікарні"
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "category": "fracture",
            "title": "Перша допомога при переломах",
            "steps": [
                "Не переміщуйте постраждалого без необхідності",
                "Зафіксуйте пошкоджену кінцівку в тому положенні, в якому вона знаходиться",
                "Використовуйте шину (дошку, палицю) для іммобілізації",
                "Прикладіть холод до місця травми для зменшення набряку",
                "При відкритому переломі накрийте рану стерильною пов'язкою",
                "Не намагайтеся вправити кістку самостійно",
                "Викличте швидку або транспортуйте до лікарні обережно"
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "category": "burn",
            "title": "Допомога при опіках",
            "steps": [
                "Негайно припиніть дію джерела опіку (вогонь, гаряча рідина)",
                "Охолодіть опік під прохолодною (не холодною) проточною водою 10-20 хвилин",
                "Зніміть прикраси та тісний одяг до появи набряку",
                "Накрийте опік чистою вологою тканиною",
                "Не наносьте масло, крем чи мазь на опік",
                "Не проколюйте пухирі",
                "При великих опіках або опіках обличчя - негайно до лікарні"
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "category": "cpr",
            "title": "Серцево-легенева реанімація (СЛР)",
            "steps": [
                "Перевірте свідомість - голосно запитайте: 'Ви в порядку?'",
                "Викличте швидку (103) або попросіть когось це зробити",
                "Покладіть людину на спину на тверду поверхню",
                "Розташуйте долоні одну на одній в центрі грудей",
                "Робіть 30 натискань на грудну клітку (глибина 5-6 см, темп 100-120/хв)",
                "Після 30 натискань зробіть 2 вдихи 'рот в рот'",
                "Продовжуйте цикли 30:2 до прибуття швидкої або появи ознак життя"
            ]
        }
    ]
    await db.medical_instructions.insert_many(instructions)
    
    # Sample alerts
    alerts = [
        {
            "id": str(uuid.uuid4()),
            "region": "Київська область",
            "alert_type": "air_raid",
            "start_time": datetime.now(timezone.utc).isoformat(),
            "end_time": None,
            "is_active": True,
            "description": "Повітряна тривога. Пройдіть до укриття."
        }
    ]
    await db.alerts.insert_many(alerts)
    
    # Sample telegram messages
    messages = [
        {
            "id": str(uuid.uuid4()),
            "message_text": "Повітряна тривога в Київській області! Пройдіть до укриття.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "channel_name": "kpszsu"
        },
        {
            "id": str(uuid.uuid4()),
            "message_text": "Зафіксовано активність БПЛА в Харківській області.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "channel_name": "kpszsu"
        }
    ]
    await db.telegram_messages.insert_many(messages)
    
    return {"message": "Sample data initialized successfully", "counts": {
        "regions": len(regions),
        "shelters": len(shelters),
        "medical_instructions": len(instructions),
        "alerts": len(alerts),
        "telegram_messages": len(messages)
    }}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()