import sqlite3
import os

DB_PATH = 'mediscan_clinical.db'
if not os.path.exists(DB_PATH):
    print(f"Error: {DB_PATH} not found in {os.getcwd()}")
else:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("--- History Table ---")
    cursor.execute("PRAGMA table_info(history)")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Patients Table ---")
    cursor.execute("PRAGMA table_info(patients)")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()
