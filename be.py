from fastapi import FastAPI, HTTPException, Depends
from pymongo import MongoClient
from pydantic import BaseModel
from datetime import datetime
from typing import List

# Initialize FastAPI app
app = FastAPI()

# Connect to MongoDB (Ensure MongoDB is running)
client = MongoClient("mongodb://localhost:27017/")
db = client.smart_study
schedules_collection = db.schedules

# Pydantic models for request validation
class Schedule(BaseModel):
    user_id: str
    subject: str
    start_time: str  # ISO format: "YYYY-MM-DD HH:MM"
    end_time: str  # ISO format: "YYYY-MM-DD HH:MM"

# API Endpoints
@app.post("/schedule/add")
def add_schedule(schedule: Schedule):
    schedule_dict = schedule.dict()
    schedule_dict["start_time"] = datetime.strptime(schedule.start_time, "%Y-%m-%d %H:%M")
    schedule_dict["end_time"] = datetime.strptime(schedule.end_time, "%Y-%m-%d %H:%M")
    schedules_collection.insert_one(schedule_dict)
    return {"message": "Schedule added successfully"}

@app.get("/schedule/{user_id}", response_model=List[Schedule])
def get_schedules(user_id: str):
    schedules = list(schedules_collection.find({"user_id": user_id}, {"_id": 0}))
    if not schedules:
        raise HTTPException(status_code=404, detail="No schedules found")
    return schedules

@app.put("/schedule/update/{user_id}")
def update_schedule(user_id: str, schedule: Schedule):
    result = schedules_collection.update_one(
        {"user_id": user_id, "subject": schedule.subject},
        {"$set": {"start_time": schedule.start_time, "end_time": schedule.end_time}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule updated successfully"}

@app.delete("/schedule/delete/{user_id}/{subject}")
def delete_schedule(user_id: str, subject: str):
    result = schedules_collection.delete_one({"user_id": user_id, "subject": subject})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted successfully"}
