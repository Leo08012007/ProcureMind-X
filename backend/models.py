from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Analyst, Manager, Director, Admin
    status = Column(String, default="active")

class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    contact_email = Column(String, nullable=False)
    country = Column(String, nullable=False)
    reliability_score = Column(Float, default=100.0) # 0 to 100
    risk_category = Column(String, default="Low") # Low, Medium, High
    status = Column(String, default="active")
    
    quotations = relationship("Quotation", back_populates="vendor")
    contracts = relationship("Contract", back_populates="vendor")
    purchase_orders = relationship("PurchaseOrder", back_populates="vendor")

class RFQ(Base):
    __tablename__ = "rfqs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    item_description = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    target_delivery_date = Column(String, nullable=False)
    status = Column(String, default="Open") # Open, Quotes_Received, Under_Negotiation, Closed
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    quotations = relationship("Quotation", back_populates="rfq")
    purchase_orders = relationship("PurchaseOrder", back_populates="rfq")

class Quotation(Base):
    __tablename__ = "quotations"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    unit_price = Column(Float, nullable=False)
    lead_time_days = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    payment_terms = Column(String, nullable=False)
    status = Column(String, default="Received") # Received, Under_Review, Accepted, Rejected
    document_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="quotations")
    vendor = relationship("Vendor", back_populates="quotations")
    purchase_orders = relationship("PurchaseOrder", back_populates="quotation")

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    terms_text = Column(Text, nullable=False)
    risk_score = Column(Float, default=0.0) # computed risk assessment
    
    vendor = relationship("Vendor", back_populates="contracts")

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    current_stock = Column(Integer, nullable=False)
    reorder_point = Column(Integer, nullable=False)
    cost_per_unit = Column(Float, nullable=False)
    location = Column(String, nullable=False)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="Draft") # Draft, Pending_Approval, Approved, Sent, Completed
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rfq = relationship("RFQ", back_populates="purchase_orders")
    quotation = relationship("Quotation", back_populates="purchase_orders")
    vendor = relationship("Vendor", back_populates="purchase_orders")

class AgentRun(Base):
    __tablename__ = "agent_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    run_type = Column(String, nullable=False) # e.g. "Reorder Swarm", "Vendor Discovery"
    status = Column(String, default="Running") # Running, Completed, Failed
    current_step = Column(String, nullable=True)
    logs = Column(JSON, default=list) # List of dictionaries {timestamp, agent, message}
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
