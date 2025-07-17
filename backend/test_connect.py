from django.conf import settings
from pymongo import MongoClient
from datetime import datetime

def test_mongodb_connection():
    try:
        # Get database settings
        db_settings = settings.DATABASES['default']
        
        # Create connection string
        client = MongoClient(
            host=db_settings['CLIENT']['host'],
            port=db_settings['CLIENT']['port'],
            username=db_settings['CLIENT']['username'],
            password=db_settings['CLIENT']['password'],
            authSource=db_settings['CLIENT'].get('authSource', 'admin')
        )
        
        # Get database
        db = client[db_settings['NAME']]
        
        # Create a test document
        test_doc = {
            'username': 'SyedAejazAhmed',
            'test_time': datetime.utcnow(),
            'message': 'Connection test successful'
        }
        
        # Insert test document
        result = db.test_collection.insert_one(test_doc)
        
        # Verify insertion
        found_doc = db.test_collection.find_one({'_id': result.inserted_id})
        
        print("✅ MongoDB Connection Test Results:")
        print("-" * 40)
        print(f"Database: {db_settings['NAME']}")
        print(f"Connected to: {db_settings['CLIENT']['host']}:{db_settings['CLIENT']['port']}")
        print(f"Auth Source: {db_settings['CLIENT'].get('authSource', 'admin')}")
        print(f"Test Document ID: {result.inserted_id}")
        print(f"Retrieved Document: {found_doc}")
        
        # Clean up test document
        db.test_collection.delete_one({'_id': result.inserted_id})
        print("\n✅ Test document cleaned up successfully")
        
        return True
        
    except Exception as e:
        print("❌ MongoDB Connection Test Failed:")
        print("-" * 40)
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    test_mongodb_connection()