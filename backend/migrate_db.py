import sqlite3
DB_PATH = 'mediscan_clinical.db'
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE history ADD COLUMN explanation TEXT")
    print("Column 'explanation' added successfully.")
except sqlite3.OperationalError:
    print("Column 'explanation' already exists.")
conn.commit()
conn.close()
