import random, time

otp_store = {}

def generate_otp(mobile: str) -> str:
    otp = str(random.randint(100000, 999999))
    otp_store[mobile] = {"otp": otp, "expires": time.time() + 300}
    print(f"DEBUG OTP for {mobile}: {otp}")  # Replace with SMS
    return otp

def verify_otp(mobile: str, otp: str) -> bool:
    data = otp_store.get(mobile)
    if not data:
        return False
    if time.time() > data["expires"]:
        del otp_store[mobile]
        return False
    if data["otp"] == otp:
        del otp_store[mobile]
        return True
    return False
