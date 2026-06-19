# أثر عُمان

موقع موسوعة التاريخ العُماني — HTML + CSS + JavaScript فقط.

## التشغيل
افتح `home.html` مباشرة من المتصفح أو ارفع مجلد `public/` كاملًا إلى Netlify / GitHub Pages.

## إضافة مقال جديد
1. أنشئ ملف HTML داخل `articles/` مثل: `articles/my-article.html`
2. أضف في أعلى الملف وسوم meta:
```html
<meta name="title" content="عنوان المقال" />
<meta name="category" content="personalities" /> <!-- personalities | events | battles | states -->
<meta name="group" content="yaaruba" /> <!-- اختياري: malik | abd-azz | aimma | nabhani | yaaruba | busaid | pre-malik -->
<meta name="image" content="/assets/your-image.jpg" />
<meta name="date" content="2025-06-01" />
<meta name="excerpt" content="وصف مختصر" />
<meta name="tags" content="وسم1,وسم2" />
<article>...المحتوى...</article>
```
3. أضف سطرًا في `articles/index.json` بنفس البيانات الوصفية (slug = اسم الملف بدون .html).

## التواصل
asadgemar7@gmail.com
