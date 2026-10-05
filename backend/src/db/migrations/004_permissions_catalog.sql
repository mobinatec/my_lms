CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'عمومی',
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_key VARCHAR(80) NOT NULL REFERENCES roles(key) ON DELETE CASCADE,
  permission_key VARCHAR(120) NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_key, permission_key)
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_key);

INSERT INTO permissions(key,title,category,description) VALUES
('dashboard.view','مشاهده داشبورد','داشبورد','مشاهده آمار و خلاصه مدیریتی'),
('users.view','مشاهده کاربران','کاربران','مشاهده فهرست کاربران'),
('users.manage','مدیریت کاربران','کاربران','ویرایش، تعلیق و مدیریت کاربران'),
('roles.view','مشاهده نقش‌ها','امنیت','مشاهده نقش‌ها و دسترسی‌ها'),
('roles.manage','مدیریت نقش‌ها','امنیت','ایجاد، ویرایش و حذف نقش‌ها'),
('permissions.view','مشاهده دسترسی‌ها','امنیت','مشاهده فهرست دسترسی‌های قابل انتخاب'),
('permissions.manage','مدیریت دسترسی‌ها','امنیت','مدیریت کاتالوگ دسترسی‌ها'),
('courses.view','مشاهده دوره‌ها','آموزش','مشاهده دوره‌ها و جلسات'),
('courses.manage','مدیریت دوره‌ها','آموزش','ایجاد، ویرایش و حذف دوره‌ها'),
('lessons.manage','مدیریت جلسات','آموزش','مدیریت جلسات و ویدئوها'),
('students.view','مشاهده دانشجویان','آموزش','مشاهده دانشجویان و پیشرفت'),
('messages.manage','مدیریت پیام‌ها','ارتباطات','مدیریت پیام‌های کاربران و مدرس'),
('reviews.view','مشاهده نظرات','محتوا','مشاهده نظرات کاربران'),
('reviews.manage','مدیریت نظرات','محتوا','تأیید، رد و ارجاع نظرات'),
('portfolio.manage','مدیریت نمونه‌کارها','محتوا','ایجاد و ویرایش نمونه‌کارها'),
('services.manage','مدیریت خدمات','محتوا','ایجاد و ویرایش خدمات'),
('team.manage','مدیریت تیم','محتوا','مدیریت اعضای تیم و رزومه‌ها'),
('blog.manage','مدیریت وبلاگ','محتوا','ایجاد و ویرایش مقالات'),
('plans.manage','مدیریت پلن‌ها','فروش','مدیریت پلن‌های دوره و عضویت'),
('subscriptions.view','مشاهده اشتراک‌ها','فروش','مشاهده اشتراک‌های کاربران'),
('orders.view','مشاهده سفارش‌ها','فروش','مشاهده سفارش‌ها و پرداخت‌ها'),
('analytics.view','مشاهده آمار','گزارش‌ها','مشاهده آمار بازدید'),
('audit.view','مشاهده Audit Log','امنیت','مشاهده سوابق فعالیت'),
('site-settings.manage','مدیریت تنظیمات سایت','سیستم','ویرایش تنظیمات عمومی سایت'),
('profile.edit','ویرایش پروفایل','عمومی','ویرایش اطلاعات پروفایل'),
('contacts.view','مشاهده تماس‌ها','ارتباطات','مشاهده پیام‌های تماس')
ON CONFLICT (key) DO UPDATE SET title=EXCLUDED.title,category=EXCLUDED.category,description=EXCLUDED.description,updated_at=NOW();

INSERT INTO role_permissions(role_key,permission_key)
SELECT r.key, p.key
FROM roles r
CROSS JOIN LATERAL jsonb_array_elements_text(r.permissions) j(value)
JOIN permissions p ON p.key=j.value
WHERE j.value <> '*'
ON CONFLICT DO NOTHING;
