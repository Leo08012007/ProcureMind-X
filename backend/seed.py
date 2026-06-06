from database import engine, Base, SessionLocal
from models import User, Vendor, InventoryItem, Contract, AgentRun
import datetime

def seed_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if seeded
    if db.query(User).first() is not None:
        db.close()
        return
        
    print("Seeding database with high-fidelity enterprise datasets...")
    
    # 1. Seed Users
    users = [
        User(email="admin@procuremind.ai", password_hash="PBKDF2_SECURE_HASH_VAL", full_name="Sarah Jenkins", role="Admin", status="active"),
        User(email="analyst@procuremind.ai", password_hash="PBKDF2_SECURE_HASH_VAL", full_name="David Chen", role="Analyst", status="active"),
        User(email="director@procuremind.ai", password_hash="PBKDF2_SECURE_HASH_VAL", full_name="Elena Rostova", role="Director", status="active")
    ]
    for u in users:
        db.add(u)
    db.commit()
    
    # 2. Seed Vendors
    vendors = [
        Vendor(name="Acme Industrial Parts", contact_email="sales@acme-parts.com", country="USA", reliability_score=94.5, risk_category="Low", status="active"),
        Vendor(name="Zenith Components Ltd", contact_email="orders@zenithcomp.jp", country="Japan", reliability_score=91.0, risk_category="Medium", status="active"),
        Vendor(name="Global Foundry Co", contact_email="ops@globalfoundry.tw", country="Taiwan", reliability_score=87.2, risk_category="Medium", status="active"),
        Vendor(name="Apex Supply Chain Solutions", contact_email="logistics@apexsupply.de", country="Germany", reliability_score=98.0, risk_category="Low", status="active")
    ]
    for v in vendors:
        db.add(v)
    db.commit()
    
    # 3. Seed Inventory Items
    inventory = [
        InventoryItem(sku="SKU-ACC-001", name="Microprocessors (12-Core)", current_stock=150, reorder_point=200, cost_per_unit=12.50, location="Warehouse A (Dallas)"),
        InventoryItem(sku="SKU-ZEN-009", name="Capacitors (100uF)", current_stock=800, reorder_point=500, cost_per_unit=1.20, location="Warehouse B (Tokyo)"),
        InventoryItem(sku="SKU-GLO-102", name="Sensors (Optoelectronic)", current_stock=90, reorder_point=100, cost_per_unit=22.00, location="Warehouse A (Dallas)")
    ]
    for item in inventory:
        db.add(item)
    db.commit()
    
    # Fetch vendor IDs for contracts
    v_acme = db.query(Vendor).filter(Vendor.name == "Acme Industrial Parts").first()
    v_zenith = db.query(Vendor).filter(Vendor.name == "Zenith Components Ltd").first()
    
    # 4. Seed Contracts
    contracts = [
        Contract(vendor_id=v_acme.id, start_date="2026-01-01", end_date="2027-01-01", value=250000.00, terms_text="Acme Industrial parts supplier contract. Unit price for part SKU-ACC-001 is fixed at $12.50. Standard delivery lead time is 7 days. Penalty for delayed deliveries is 2% of PO amount per day. Force majeure conditions apply. Payment terms: Net 30.", risk_score=12.0),
        Contract(vendor_id=v_zenith.id, start_date="2026-02-15", end_date="2027-02-15", value=180000.00, terms_text="Zenith Components parts agreement. Unit price for part SKU-ZEN-009 is $1.20. Expedited delivery within 3 days is available at a 15% surcharge. Standard lead time is 10 days. Payment terms: Net 15.", risk_score=28.5)
    ]
    for c in contracts:
        db.add(c)
    db.commit()
    
    # 5. Seed past completed agent runs
    run = AgentRun(
        run_type="Reorder Swarm",
        status="Completed",
        current_step="Done",
        logs=[
            {"timestamp": "08:10:02", "agent": "Inventory Agent", "message": "Low stock detected for SKU-GLO-102 (Sensors). Stock: 90 / Reorder Point: 100."},
            {"timestamp": "08:10:04", "agent": "Requirement Agent", "message": "RFQ created for 200 units of Sensors."},
            {"timestamp": "08:10:07", "agent": "Vendor Discovery Agent", "message": "Found matching vendors: Zenith Components, Global Foundry."},
            {"timestamp": "08:10:10", "agent": "Quote Analysis Agent", "message": "Analyzed quotes. Selected Zenith Components (Unit Price: $22.00, Lead Time: 10 days)."},
            {"timestamp": "08:10:12", "agent": "Negotiation Agent", "message": "Negotiated discount. Unit Price: $22.00 -> $20.24 (8% savings)."},
            {"timestamp": "08:10:15", "agent": "Approval Agent", "message": "Purchase Order PO-1 created and pending review."}
        ],
        summary="Autonomous negotiation completed. Purchase Order PO-1 generated for Zenith Components Ltd."
    )
    db.add(run)
    db.commit()
    
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
