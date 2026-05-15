# 🔌 מחשבון חתך כבלים - SI 900

מחשבון חתך כבלים לפי תקן ישראלי SI 900 / IEC 60364-5-52.

---

## שימוש מהיר (ללא התקנה)

פתח את הקובץ `cable-calculator.html` ישירות בכרום — ללא שרת, ללא התקנה.

---

## מבנה הפרויקט

```
cable-calc/
├── cable-calculator.html          ← גרסה עצמאית לדפדפן (ללא שרת)
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js              ← Express API (פורט 3001)
│       ├── constants/
│       │   ├── israeliStandards.js  ← מגבלות, מקדמים, שיטות התקנה (SI 900)
│       │   └── cableTables.js       ← טבלאות קיבולת זרם (Cu/Al × PVC/XLPE)
│       ├── models/
│       │   ├── Cable.js             ← מודל כבל: חומר, בידוד, חתך, אורך
│       │   ├── Load.js              ← מודל עומס: הספק, cosφ, זרם עיצוב IB
│       │   ├── InstallationConditions.js ← מקדמי טמפ׳ וקיבוץ
│       │   └── Breaker.js           ← מודל מבטח: In, סוג, עקומה, בדיקות IEC
│       └── calculators/
│           └── CableCalculator.js   ← לוגיקת חישוב ראשית
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── hooks/
        │   └── useCableCalculator.js  ← React hooks ל-API
        └── components/
            ├── CableForm.jsx          ← טופס נתוני כבל
            ├── LoadForm.jsx           ← טופס נתוני עומס
            ├── ConditionsForm.jsx     ← טופס תנאי התקנה
            ├── BreakerForm.jsx        ← טופס מבטח / הגנת יתר-זרם
            └── ResultPanel.jsx        ← הצגת תוצאות
```

---

## הרצת הפרויקט המלא (Node.js + React)

**Backend:**
```bash
cd backend
npm install
npm run dev   # פורט 3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # פורט 3000
```

---

## עקרונות OOP

| Class | אחריות |
|-------|--------|
| `Cable` | תכונות פיזיות + חישובי עמידות/ריאקטנס בלבד |
| `Load` | נתוני עומס + חישוב זרם עיצוב IB |
| `InstallationConditions` | מקדמי תיקון: טמפרטורה (Ct), קיבוץ (Cg) |
| `Breaker` | נתוני מבטח + בדיקת 3 תנאי IEC 60364-4-43 |
| `CalculationResult` | data container עם `toJSON()` ו-`summary` |
| `CableCalculator` | פונקציות stateless שמחברות בין כל המודלים |

---

## חישובים מיושמים

### 1. קיבולת זרם מתוקנת
```
Iz = Iz_table × Ct × Cg
```
- `Iz_table` — מטבלאות IEC 60364-5-52 לפי חומר, בידוד, שיטת התקנה
- `Ct` — מקדם טמפרטורה (ברירת מחדל ישראל: 35°C)
- `Cg` — מקדם קיבוץ לפי מספר מעגלים צמודים

### 2. נפילת מתח
```
ΔU = √3 × I × (R·cosφ + X·sinφ) × L   [תלת-פאזי]
ΔU = 2  × I × (R·cosφ + X·sinφ) × L   [חד-פאזי]
```
מגבלות לפי SI 900: תאורה 3%, כוח 5%, מנועים 15%, ציוד רגיש 2%

### 3. הגנת יתר-זרם — מבטח (IEC 60364-4-43)
שלושה תנאים שחייבים להתקיים:
```
IB ≤ In          ← המבטח מעל זרם העיצוב
In ≤ Iz          ← המבטח מתחת לקיבולת הכבל
I2 ≤ 1.45 × Iz  ← זרם הפסיקה המובטח לא חורג
```
כאשר `I2 = 1.45 × In` (MCB) או `I2 = 1.6 × In` (פיוז)

---

## מצבי פעולה (ב-HTML ובממשק React)

| מצב | תיאור |
|-----|--------|
| **המלצת חתך אוטומטית** | עובר על כל החתכים הסטנדרטיים ומחזיר את הקטן ביותר שעובר |
| **בדיקת חתך ידנית** | המשתמש בוחר חתך ספציפי ומקבל עובר/נכשל לכל בדיקה |

---

## TODO — הרחבות עתידיות

- [ ] חישוב אימפדנס מעגל + בדיקת זרם קצר (Icc)
- [ ] בדיקת RCD (פסק דיפרנציאלי) לפי סוג מעגל
- [ ] כבל 3 ליבות בקרקע עם תיקון צפיפות (Cs)
- [ ] כבלי MV (6kV / 12kV)
- [ ] ייצוא לדוח PDF
- [ ] שמירת חישובים היסטוריים