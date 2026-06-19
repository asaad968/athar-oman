# دليل النشر على الاستضافات المختلفة

تم تعديل هذا المشروع ليعمل على أي منصة استضافة. فيما يلي التعليمات لكل منصة:

## 🔧 التعديلات التي تم إجراؤها

### 1. **المسارات النسبية (Relative Paths)**
- تم تحويل جميع المسارات المطلقة (`/path`) إلى مسارات نسبية (`./path`)
- تم إنشاء ملف `public/js/base-path.js` يدعم المسارات الديناميكية
- الموقع يعمل الآن على النطاق الرئيسي وفي المجلدات الفرعية

### 2. **ملفات الإعدادات**
- `vercel.json` - إعدادات Vercel
- `wrangler.toml` - إعدادات Cloudflare Pages
- `_config.yml` - إعدادات GitHub Pages
- `.nojekyll` - لتعطيل معالجة Jekyll على GitHub Pages
- `public/_redirects` - قواعس إعادة التوجيه
- `.github/workflows/deploy.yml` - سير العمل التلقائي

---

## 📦 GitHub Pages

### الخطوات:

1. **إنشاء مستودع على GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **تفعيل GitHub Pages**
   - اذهب إلى Settings > Pages
   - اختر "Deploy from a branch"
   - اختر `main` و `/ (root)`

3. **النشر التلقائي**
   - سيتم النشر تلقائياً عند كل push إلى main
   - الموقع سيكون متاحاً على: `https://YOUR_USERNAME.github.io/YOUR_REPO`

### ملاحظات:
- الموقع يدعم المجلدات الفرعية تلقائياً
- لا تحتاج إلى أي إعدادات إضافية

---

## 🚀 Vercel

### الخطوات:

1. **تثبيت Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **النشر الأول**
   ```bash
   vercel
   ```
   - اتبع التعليمات على الشاشة
   - اختر المشروع والإعدادات

3. **النشر المستقبلي**
   ```bash
   vercel --prod
   ```

### الإعدادات:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### ملاحظات:
- Vercel يدعم المسارات النسبية تلقائياً
- يمكنك ربط مستودع GitHub للنشر التلقائي

---

## ☁️ Cloudflare Pages

### الخطوات:

1. **ربط مستودع GitHub**
   - اذهب إلى Cloudflare Dashboard
   - اختر Pages > Create a project
   - اختر "Connect to Git"
   - اختر مستودعك

2. **الإعدادات**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

3. **النشر**
   - سيتم النشر تلقائياً عند كل push

### الإعدادات المتقدمة:
- يمكنك استخدام `wrangler.toml` للإعدادات المتقدمة
- دعم المتغيرات البيئية

### ملاحظات:
- Cloudflare Pages مجاني وسريع جداً
- يدعم المسارات النسبية تلقائياً

---

## 🌐 استضافة عامة (Apache, Nginx, إلخ)

### الخطوات:

1. **البناء المحلي**
   ```bash
   npm run build
   ```

2. **رفع ملفات `dist`**
   - استخدم FTP أو SSH
   - ارفع محتوى مجلد `dist` إلى جذر الموقع

3. **إعدادات الخادم**
   
   **لـ Apache (.htaccess)**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **لـ Nginx**
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### ملاحظات:
- تأكد من أن الخادم يدعم المسارات النسبية
- قد تحتاج إلى إعادة تكوين الخادم

---

## ✅ اختبار الموقع محلياً

```bash
# تثبيت الاعتمادات
npm install

# تشغيل خادم التطوير
npm run dev

# البناء للإنتاج
npm run build

# معاينة الإنتاج
npm run preview
```

---

## 🔍 التحقق من المشاكل الشائعة

### المشكلة: الروابط لا تعمل
- **الحل**: تأكد من أن الموقع يستخدم المسارات النسبية (`./path` بدلاً من `/path`)

### المشكلة: الصور لا تظهر
- **الحل**: تحقق من أن مسارات الصور نسبية في `public/articles/index.json`

### المشكلة: البحث لا يعمل
- **الحل**: تأكد من أن `public/js/base-path.js` محمل قبل `article-loader.js`

### المشكلة: الموقع لا يعمل في مجلد فرعي
- **الحل**: الموقع يدعم المجلدات الفرعية تلقائياً بفضل `base-path.js`

---

## 📝 ملفات تم تعديلها

### ملفات HTML:
- `public/home.html` - تم تحويل المسارات إلى نسبية
- `public/article.html` - تم تحويل المسارات إلى نسبية
- `public/category.html` - تم تحويل المسارات إلى نسبية
- `public/search.html` - تم تحويل المسارات إلى نسبية

### ملفات JavaScript:
- `public/js/base-path.js` - ملف جديد لدعم المسارات الديناميكية
- `public/js/article-loader.js` - تم تحديثه لاستخدام `buildPath()`
- `public/js/app.js` - تم تحديثه لاستخدام `buildPath()`
- `public/js/search.js` - تم تحديثه لاستخدام `buildPath()`

### ملفات React/TypeScript:
- `src/routes/index.tsx` - تم تحويل المسارات إلى نسبية
- `src/routes/__root.tsx` - تم تحويل المسارات إلى نسبية

---

## 🎯 الخطوات التالية

1. اختر منصة الاستضافة المفضلة لديك
2. اتبع التعليمات المناسبة أعلاه
3. اختبر الموقع بعد النشر
4. تأكد من أن جميع الروابط والصور تعمل بشكل صحيح

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من أن جميع الملفات تم نسخها بشكل صحيح
2. تأكد من أن الخادم يدعم المسارات النسبية
3. افحص console في متصفح الويب للأخطاء
4. تحقق من أن `base-path.js` محمل بشكل صحيح

---

**آخر تحديث**: يونيو 2026
**الإصدار**: 2.0 (متوافق مع جميع الاستضافات)
