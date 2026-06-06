import sys
import os
import pandas as pd

# Add backend directory to system path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from ml.pipeline import ProcureMLSuite
from ai.rag import RAGPipeline
from database import SessionLocal, Base, engine
from models import User, Vendor, RFQ, AgentRun, InventoryItem
from agents.swarm import ProcureAgentSwarm

def verify_ml():
    print("\n--- Verifying Machine Learning Pipeline ---")
    suite = ProcureMLSuite()
    
    # 1. Test Risk Scoring
    print("Testing Vendor Risk scoring...")
    risk = suite.predict_vendor_risk(10.0, 0.05, 1.0, 0.02)
    print(f"Risk Output: {risk}")
    assert risk["risk_category"] in ["Low", "Medium", "High"]
    
    # 2. Test Price Prediction
    print("Testing Price Prediction forecasting...")
    price = suite.predict_price(150, 500, 7, 1.02)
    print(f"Predicted price: ${price:.2f}/unit")
    assert price > 0
    
    # 3. Test Spend Optimization
    print("Testing Spend Optimization heuristic...")
    spend_mock = [
        {"vendor_name": "Acme Parts", "category": "Components", "spend_amount": 100000.0, "contract_unit_price": 12.50, "market_average_price": 13.00},
        {"vendor_name": "Zenith Ltd", "category": "Components", "spend_amount": 80000.0, "contract_unit_price": 22.00, "market_average_price": 21.00}
    ]
    opt = suite.optimize_spend(spend_mock)
    print(f"Savings target found: ${opt['potential_savings']:.2f}")
    assert opt["potential_savings"] >= 0
    
    print("ML Pipeline verification: SUCCESS")

def verify_rag():
    print("\n--- Verifying AI RAG Pipeline & Vector Search ---")
    rag = RAGPipeline()
    
    # Test text search
    query = "Acme contract lead time and delay penalty clause"
    print(f"Querying vector store for: '{query}'")
    res = rag.query(query)
    print(f"RAG Response: {res['answer']}")
    print(f"Sources identified: {res['sources']}")
    assert len(res["sources"]) > 0
    
    # Test OCR parser simulation
    print("Testing OCR parser simulation...")
    invoice_text = "Zenith Components quote sheet. SKU-ZEN-009 price 21.5, lead time 5 days, Net 15 terms."
    parsed = rag.parse_pdf_quote("zenith_quote.pdf", invoice_text)
    print(f"Parsed OCR details: {parsed}")
    assert parsed["vendor_name"] == "Zenith Components"
    assert parsed["unit_price"] == 21.5
    
    print("RAG Pipeline verification: SUCCESS")

def verify_agents():
    print("\n--- Verifying Multi-Agent Swarm Orchestration ---")
    # Initialize DB schema for test run
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Ensure a user exists
    user = db.query(User).first()
    if not user:
        user = User(email="test@procuremind.ai", password_hash="test", full_name="Tester", role="Admin")
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Ensure vendors exist
    if not db.query(Vendor).first():
        v = Vendor(name="Acme Industrial Parts", contact_email="sales@acme.com", country="USA", reliability_score=95.0, risk_category="Low")
        db.add(v)
        db.commit()
        
    # Ensure inventory item exists
    if not db.query(InventoryItem).first():
        item = InventoryItem(sku="SKU-ACC-001", name="Microprocessors (12-Core)", current_stock=150, reorder_point=200, cost_per_unit=12.50, location="Warehouse A")
        db.add(item)
        db.commit()

    # 1. Create RFQ
    rfq = RFQ(title="Verify Reorder", item_description="Microprocessors", quantity=300, target_delivery_date="2026-08-01", status="Open")
    db.add(rfq)
    db.commit()
    db.refresh(rfq)
    
    # 2. Create Agent Run
    run = AgentRun(run_type="Reorder Swarm", status="Running")
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # 3. Execute Swarm
    swarm = ProcureAgentSwarm()
    print("Running autonomous reorder swarm sequentially...")
    po_id = swarm.run_reorder_swarm(db, rfq.id, run.id)
    
    # Fetch completed run logs
    db.refresh(run)
    print(f"Swarm Run completed with status: {run.status}")
    print("Step logs logged:")
    for log in run.logs:
        print(f"  [{log['agent']}]: {log['message']}")
        
    assert run.status == "Completed"
    assert po_id is not None
    print("Multi-Agent Swarm verification: SUCCESS")
    
    db.close()

if __name__ == "__main__":
    print("==================================================")
    print("STARTING PROCUREMIND X INTEGRATION VERIFICATION")
    print("==================================================")
    
    try:
        verify_ml()
        verify_rag()
        verify_agents()
        print("\n==================================================")
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
        print("SYSTEM READY FOR PRODUCTION HACKATHON DEMONSTRATION")
        print("==================================================")
    except Exception as e:
        print(f"\nVerification FAILED with error: {e}")
        sys.exit(1)
