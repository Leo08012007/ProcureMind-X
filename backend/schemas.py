from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    status: str
    
    class Config:
        from_attributes = True

class VendorResponse(BaseModel):
    id: int
    name: str
    contact_email: str
    country: str
    reliability_score: float
    risk_category: str
    status: str
    
    class Config:
        from_attributes = True

class RFQCreate(BaseModel):
    title: str
    item_description: str
    quantity: int
    target_delivery_date: str

class RFQResponse(BaseModel):
    id: int
    title: str
    item_description: str
    quantity: int
    target_delivery_date: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    rfq_id: int
    vendor_id: int
    unit_price: float
    lead_time_days: int
    payment_terms: str
    document_path: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    rfq_id: int
    vendor_id: int
    unit_price: float
    lead_time_days: int
    total_price: float
    payment_terms: str
    status: str
    document_path: Optional[str] = None
    created_at: datetime
    vendor: VendorResponse
    
    class Config:
        from_attributes = True

class ContractResponse(BaseModel):
    id: int
    vendor_id: int
    start_date: str
    end_date: str
    value: float
    terms_text: str
    risk_score: float
    
    class Config:
        from_attributes = True

class InventoryItemResponse(BaseModel):
    id: int
    sku: str
    name: str
    current_stock: int
    reorder_point: int
    cost_per_unit: float
    location: str
    
    class Config:
        from_attributes = True

class InventoryItemUpdate(BaseModel):
    current_stock: int

class PurchaseOrderResponse(BaseModel):
    id: int
    rfq_id: int
    quotation_id: int
    vendor_id: int
    total_amount: float
    status: str
    created_at: datetime
    vendor: VendorResponse
    
    class Config:
        from_attributes = True

class PurchaseOrderUpdate(BaseModel):
    status: str

class AgentRunLogEntry(BaseModel):
    timestamp: str
    agent: str
    message: str

class AgentRunResponse(BaseModel):
    id: int
    run_type: str
    status: str
    current_step: Optional[str] = None
    logs: List[Any]
    summary: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    price_spike_pct: float
    supplier_failure: bool
    delivery_delay_days: int

class SimulationResponse(BaseModel):
    base_case: List[dict]
    simulated_case: List[dict]
    risk_alerts: List[str]
