from typing import Optional, List
from datetime import datetime, timezone, date
from bson import ObjectId
from app.database import get_appointments_collection
from app.schemas.appointment import AppointmentCreate, AppointmentStatusUpdate, AppointmentStatus


def doc_to_dict(doc: dict) -> dict:
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_appointment(data: AppointmentCreate) -> dict:
    col = get_appointments_collection()
    now = datetime.now(timezone.utc)
    doc = {
        **data.model_dump(),
        "city": data.city.value,
        "status": AppointmentStatus.pending.value,
        "adminNotes": "",
        "createdAt": now,
        "updatedAt": now,
    }
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return doc_to_dict(created)


async def get_all_appointments(
    status: Optional[str] = None,
    city: Optional[str] = None,
    date_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> dict:
    col = get_appointments_collection()
    query: dict = {}
    if status:
        query["status"] = status
    if city:
        query["city"] = city
    if date_filter:
        query["preferredDate"] = date_filter

    total = await col.count_documents(query)
    skip = (page - 1) * limit
    cursor = col.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    appointments = [doc_to_dict(doc) async for doc in cursor]
    return {"appointments": appointments, "total": total, "page": page, "pages": (total + limit - 1) // limit}


async def get_appointment_by_id(appt_id: str) -> Optional[dict]:
    col = get_appointments_collection()
    try:
        doc = await col.find_one({"_id": ObjectId(appt_id)})
        return doc_to_dict(doc) if doc else None
    except Exception:
        return None


async def update_appointment_status(appt_id: str, data: AppointmentStatusUpdate) -> Optional[dict]:
    col = get_appointments_collection()
    updates = {"status": data.status.value, "updatedAt": datetime.now(timezone.utc)}
    if data.adminNotes is not None:
        updates["adminNotes"] = data.adminNotes
    try:
        await col.update_one({"_id": ObjectId(appt_id)}, {"$set": updates})
        return await get_appointment_by_id(appt_id)
    except Exception:
        return None


async def get_appointment_stats() -> dict:
    col = get_appointments_collection()
    today_str = date.today().isoformat()

    # Status counts
    pending = await col.count_documents({"status": "pending"})
    contacted = await col.count_documents({"status": "contacted"})
    confirmed = await col.count_documents({"status": "confirmed"})
    completed = await col.count_documents({"status": "completed"})
    cancelled = await col.count_documents({"status": "cancelled"})
    total = await col.count_documents({})

    # Today's appointments (by preferredDate)
    today_count = await col.count_documents({"preferredDate": today_str})

    # Upcoming (confirmed + preferredDate >= today)
    upcoming = await col.count_documents({
        "status": {"$in": ["confirmed", "contacted"]},
        "preferredDate": {"$gte": today_str},
    })

    # City breakdown
    city_pipeline = [
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    city_breakdown = {}
    async for doc in col.aggregate(city_pipeline):
        city_breakdown[doc["_id"]] = doc["count"]

    return {
        "totalAppointments": total,
        "pendingAppointments": pending,
        "contactedAppointments": contacted,
        "confirmedAppointments": confirmed,
        "completedAppointments": completed,
        "cancelledAppointments": cancelled,
        "todayAppointments": today_count,
        "upcomingAppointments": upcoming,
        "cityBreakdown": city_breakdown,
    }
