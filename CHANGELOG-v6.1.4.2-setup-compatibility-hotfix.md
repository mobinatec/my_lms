# Codesazan v6.1.4.2 — Setup Compatibility Hotfix

## هدف
رفع خطای اجرای `SETUP-PRODUCTION.ps1` روی سیستم‌هایی که نسخه PowerShell/.NET آن‌ها متد static `RandomNumberGenerator.Fill()` را ندارد.

## تغییرات
- فقط روش تولید بایت تصادفی در `SETUP-PRODUCTION.ps1` تغییر کرده است.
- تولید secret با `RNGCryptoServiceProvider.GetBytes()` انجام می‌شود تا با محیط‌های قدیمی‌تر PowerShell/.NET سازگار باشد.
- `TRUST_PROXY=1` مربوط به hotfix نسخه 6.1.4.1 حفظ شده است.
- هیچ ماژول کسب‌وکار، احراز هویت، دیتابیس، frontend یا worker تغییر نکرده است.
- `.env` واقعی همچنان داخل ZIP توزیعی قرار ندارد.

## راه‌اندازی
اگر Execution Policy اجازه اجرای مستقیم فایل ps1 را نمی‌دهد:

```powershell
powershell -ExecutionPolicy Bypass -File .\SETUP-PRODUCTION.ps1
```

سپس:

```powershell
docker compose up --build
```
