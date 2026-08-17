import urllib.request
import json
import ssl
import time
from datetime import datetime

SUPABASE_URL = "https://fckbbohlxfqoyiomyxqm.supabase.co/rest/v1/leads?select=id&limit=1"
SUPABASE_KEY = "sb_publishable_lbRx3jVpe9P7gzl3B5gFEg_5GbQXXF0"

def ping_supabase():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 Enviando PING de reactivación a Supabase...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(SUPABASE_URL, headers=headers, method="GET")
    
    # Manejar SSL context por compatibilidad
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            status = response.status
            body = response.read().decode('utf-8')
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ RESPUESTA EXITOSA - HTTP {status}")
            print(f"   Muestreo de BD: {body[:100]}")
            print(f"   💡 Estado de Supabase: ACTIVO (Contador de inactividad de 7 días reseteado)")
            return True
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ ERROR al conectar con Supabase: {e}")
        return False

if __name__ == "__main__":
    ping_supabase()
