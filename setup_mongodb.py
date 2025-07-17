from pymongo import MongoClient
import getpass
import sys

def get_user_input():
    print("\n📝 MongoDB Setup Configuration")
    print("-" * 30)
    
    admin_user = input("Enter admin username (default: adminUser): ") or "adminUser"
    admin_pwd = getpass.getpass("Enter admin password: ")
    
    app_user = input("Enter BlueGuard username (default: blueguard_user): ") or "blueguard_user"
    app_pwd = getpass.getpass("Enter BlueGuard password: ")
    
    return {
        'admin_user': admin_user,
        'admin_pwd': admin_pwd,
        'app_user': app_user,
        'app_pwd': app_pwd
    }

def setup_mongodb(config):
    try:
        print("\n🔄 Connecting to MongoDB...")
        client = MongoClient('mongodb://localhost:27017/')
        
        # Setup admin user
        print("\n🔄 Setting up admin user...")
        admin_db = client.admin
        try:
            admin_db.command('createUser', config['admin_user'],
                pwd=config['admin_pwd'],
                roles=['userAdminAnyDatabase', 'dbAdminAnyDatabase', 'readWriteAnyDatabase']
            )
            print("✅ Admin user created successfully")
        except Exception as e:
            print(f"⚠️ Admin user creation: {str(e)}")
        
        # Setup application user
        print("\n🔄 Setting up BlueGuard user...")
        blueguard_db = client.blueguard_db
        try:
            blueguard_db.command('createUser', config['app_user'],
                pwd=config['app_pwd'],
                roles=[{'role': 'readWrite', 'db': 'blueguard_db'}]
            )
            print("✅ BlueGuard user created successfully")
        except Exception as e:
            print(f"⚠️ BlueGuard user creation: {str(e)}")
        
        # Test connection
        print("\n🔄 Testing database connection...")
        test_collection = blueguard_db.test
        test_collection.insert_one({'test': 'Hello from BlueGuard!'})
        result = test_collection.find_one({'test': 'Hello from BlueGuard!'})
        print(f"✅ Test document created and retrieved: {result}")
        
        # Generate configuration
        print("\n📝 Generating Django configuration...")
        config_text = f"""
DATABASES = {{
    'default': {{
        'ENGINE': 'djongo',
        'NAME': 'blueguard_db',
        'ENFORCE_SCHEMA': True,
        'CLIENT': {{
            'host': 'localhost',
            'port': 27017,
            'username': '{config["app_user"]}',
            'password': '{config["app_pwd"]}',
            'authSource': 'blueguard_db',
            'authMechanism': 'SCRAM-SHA-1'
        }}
    }}
}}
        """
        with open('mongodb_config.txt', 'w') as f:
            f.write(config_text)
        print("✅ Configuration saved to mongodb_config.txt")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    print("🚀 Welcome to MongoDB Setup for BlueGuard AI")
    config = get_user_input()
    setup_mongodb(config)
    print("\n✅ Setup completed successfully!")