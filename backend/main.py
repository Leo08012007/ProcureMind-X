from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import datetime
import uvicorn

from database import engine, Base, get_db
from models import User, Vendor, RFQ, Quotation, Contract, InventoryItem, PurchaseOrder, AgentRun
from schemas import (
    UserLogin, Token, VendorResponse, RFQCreate, RFQResponse,
    InventoryItemResponse, PurchaseOrderResponse, AgentRunResponse
)
from seed import seed_db
from ml.pipeline import ProcureMLSuite
from ai.rag import RAGPipeline

app = FastAPI(title="ProcureMind X - API Core", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
ml_suite = ProcureMLSuite()
rag_pipeline = RAGPipeline()

@app.on_event("startup")
def startup_event():
    seed_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to ProcureMind X AI Operating System API Gateway"}

# --- AUTHENTICATION ---
@app.post("/api/auth/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or payload.password != "admin123":
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return {"access_token": f"mock_token_{user.role}_{user.email}", "token_type": "bearer"}

# --- VENDORS ---
@app.get("/api/vendors", response_model=List[VendorResponse])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

# --- INVENTORY ---
@app.get("/api/inventory", response_model=List[InventoryItemResponse])
def get_inventory(db: Session = Depends(get_db)):
    return db.query(InventoryItem).all()

# --- RFQ & AGENT SWARM INVOCATION ---
@app.post("/api/rfq", response_model=AgentRunResponse)
def create_rfq(payload: RFQCreate, background_tasks: BackgroundTasks, autonomous_mode: bool = True, db: Session = Depends(get_db)):
    from agents.swarm import ProcureAgentSwarm
    swarm_engine = ProcureAgentSwarm()
    
    rfq = RFQ(
        title=payload.title,
        item_description=payload.item_description,
        quantity=payload.quantity,
        target_delivery_date=payload.target_delivery_date,
        status="Open"
    )
    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    
    run = AgentRun(
        run_type="Reorder Swarm",
        status="Running",
        current_step="Requirement Agent",
        logs=[{"timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S"), "agent": "Orchestrator", "message": f"Autonomous swarm initiated for RFQ: {rfq.title}. Policy: {'Autonomous' if autonomous_mode else 'Manual Review'}"}]
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    
    background_tasks.add_task(swarm_engine.run_reorder_swarm, db, rfq.id, run.id, autonomous_mode)
    
    return run

@app.get("/api/agents/runs", response_model=List[AgentRunResponse])
def get_agent_runs(db: Session = Depends(get_db)):
    return db.query(AgentRun).order_by(AgentRun.created_at.desc()).all()

@app.get("/api/agents/runs/{run_id}", response_model=AgentRunResponse)
def get_agent_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Agent run details not found")
    return run

# --- DIGITAL TWIN SIMULATION ---
@app.post("/api/twin/simulate")
def simulate_twin(payload: Dict[str, Any], db: Session = Depends(get_db)):
    scenario = payload.get("scenario", "delay")
    delay_days = int(payload.get("delay_days", 0))
    price_spike_pct = float(payload.get("price_spike_pct", 0.0))
    demand_spike_pct = float(payload.get("demand_spike_pct", 0.0))

    items = db.query(InventoryItem).all()
    base_case = []
    simulated_case = []
    risk_alerts = []
    
    cost_impact = 0.0
    stockout_risk = "Low"
    delivery_impact = "Normal"
    recommended_action = "Maintain baseline schedule."

    for day in range(1, 31):
        for item in items:
            base_consumption = 5 if item.sku == "SKU-ACC-001" else (20 if item.sku == "SKU-ZEN-009" else 3)
            base_stock = max(0, item.current_stock - (base_consumption * day))
            
            sim_consumption = base_consumption
            if scenario == "demand_spike":
                sim_consumption = int(base_consumption * (1.0 + (demand_spike_pct / 100.0)))
            
            effective_stock = item.current_stock - (sim_consumption * day)
            
            lead_time = 7
            if scenario == "delay":
                lead_time += delay_days
            elif scenario == "bankruptcy":
                lead_time += 21
                
            if effective_stock <= item.reorder_point and day < lead_time:
                simulated_stock = max(0, effective_stock)
            else:
                simulated_stock = max(0, effective_stock + 150)
                
            base_case.append({"day": day, "sku": item.sku, "name": item.name, "stock": base_stock})
            simulated_case.append({"day": day, "sku": item.sku, "name": item.name, "stock": simulated_stock})

            if simulated_stock == 0:
                stockout_risk = "Critical"
                alert = f"Predicted stockout for {item.name} on Day {day}!"
                if alert not in risk_alerts:
                    risk_alerts.append(alert)

    if scenario == "delay":
        delivery_impact = f"+{delay_days} days delivery delay."
        recommended_action = f"Trigger secondary supply routing. Shift safety buffer threshold from {items[0].reorder_point} to {items[0].reorder_point + 50}."
    elif scenario == "price_spike":
        cost_impact = 315000 * (price_spike_pct / 100.0)
        recommended_action = f"Consolidate current purchasing under Zenith net-fixed rate contracts to lock lower unit prices."
    elif scenario == "bankruptcy":
        stockout_risk = "Critical"
        delivery_impact = "+21 days search pipeline latency."
        recommended_action = "ALERT: Critical supplier bankruptcy! Instantly transfer all outstanding open orders to Apex Supply Chain Solutions."
    elif scenario == "demand_spike":
        cost_impact = 315000 * (demand_spike_pct / 200.0)
        recommended_action = "Scale up minimum inventory reorder levels by 30% to accommodate demand spike requirements."

    return {
        "base_case": base_case,
        "simulated_case": simulated_case,
        "risk_alerts": risk_alerts,
        "metrics": {
            "procurement_cost_impact": round(cost_impact, 2),
            "stockout_risk": stockout_risk,
            "delivery_impact": delivery_impact,
            "recommended_action": recommended_action
        }
    }

# --- AI COPILOT CHAT & RAG ---
@app.post("/api/copilot/chat")
def copilot_chat(payload: dict):
    query = payload.get("message", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query message cannot be empty")
        
    result = rag_pipeline.query(query)
    return result

# --- OCR INVOICE UPLOAD ---
@app.post("/api/quotes/upload")
def upload_quote(file: UploadFile = File(...)):
    content = file.file.read().decode("utf-8", errors="ignore")
    parsed_res = rag_pipeline.parse_pdf_quote(file.filename, content)
    return {
        "message": "Quotation document processed and indexed successfully via OCR pipeline.",
        "filename": file.filename,
        "parsed_data": parsed_res
    }

# --- ANALYTICS & SPEND OPTIMIZATION ---
@app.get("/api/analytics/spend")
def get_spend_analytics(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).all()
    spend_history = []
    
    for v in vendors:
        base_spend = 120000.00 if "Acme" in v.name else (85000.00 if "Zenith" in v.name else 45000.00)
        unit_price = 12.50 if "Acme" in v.name else (1.20 if "Zenith" in v.name else 16.0)
        market_avg = 13.10 if "Acme" in v.name else (1.45 if "Zenith" in v.name else 17.5)
        
        spend_history.append({
            "vendor_name": v.name,
            "category": "Components",
            "spend_amount": base_spend,
            "contract_unit_price": unit_price,
            "market_average_price": market_avg
        })
        
    optimization = ml_suite.optimize_spend(spend_history)
    
    return {
        "spend_distribution": spend_history,
        "optimization": optimization
    }

# --- DECISION INTELLIGENCE ---
@app.get("/api/analytics/decision")
def get_decision_intelligence(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).all()
    spend_history = []
    
    for v in vendors:
        base_spend = 120000.00 if "Acme" in v.name else (85000.00 if "Zenith" in v.name else 45000.00)
        unit_price = 12.50 if "Acme" in v.name else (1.20 if "Zenith" in v.name else 16.0)
        market_avg = 13.10 if "Acme" in v.name else (1.45 if "Zenith" in v.name else 17.5)
        
        spend_history.append({
            "vendor_name": v.name,
            "category": "Components",
            "spend_amount": base_spend,
            "contract_unit_price": unit_price,
            "market_average_price": market_avg
        })
        
    decision = ml_suite.generate_decision_intelligence(spend_history)
    return decision

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
