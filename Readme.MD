# TodoMaster

Aplikasi manajemen tugas — React.js (frontend) + Laravel (backend).

```
/
├── todo-app/     → Frontend React.js + TypeScript + Vite
└── tomtech/      → Backend Laravel REST API
```

---

## Prasyarat

Pastikan tools berikut sudah terinstall di sistem Anda:

| Tool | Versi minimal | Cek versi |
|------|--------------|-----------|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| PHP | 8.1 | `php -v` |
| Composer | 2.x | `composer -V` |
| MySQL / SQLite | — | — |

---

## Menjalankan Backend (`tomtech/`)

```bash
# 1. Masuk ke folder backend
cd tomtech

# 2. Install dependencies PHP
composer install

# 3. Salin file konfigurasi environment
cp .env.example .env

# 4. Generate application key
php artisan key:generate
```

Buka file `tomtech/.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=todo_app
DB_USERNAME=root
DB_PASSWORD=
```

> Jika ingin pakai SQLite (lebih simpel untuk development), ganti `DB_CONNECTION=sqlite` dan buat file `database/database.sqlite`.

```bash
# 5. Jalankan migrasi database
php artisan migrate

# 6. Jalankan server backend
php artisan serve
```

Backend berjalan di: `http://127.0.0.1:8000`

---

## Menjalankan Frontend (`todo-app/`)

```bash
# 1. Masuk ke folder frontend
cd todo-app

# 2. Install dependencies
npm install

# 3. Salin file konfigurasi environment
cp .env.example .env.local
```

Buka file `todo-app/.env.local` dan isi URL backend:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

> Sesuaikan URL jika backend berjalan di IP atau port yang berbeda.

```bash
# 4. Jalankan development server
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## API Endpoints

Base URL: `http://127.0.0.1:8000/api`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/tasks` | Ambil semua tugas (support `?status=active\|completed` dan `?search=kata`) |
| `POST` | `/tasks` | Buat tugas baru |
| `GET` | `/tasks/{id}` | Detail satu tugas |
| `PUT/PATCH` | `/tasks/{id}` | Perbarui tugas |
| `DELETE` | `/tasks/{id}` | Hapus tugas |
| `PATCH` | `/tasks/{id}/toggle` | Toggle status selesai |

### Contoh request — buat tugas baru

```bash
curl -X POST http://127.0.0.1:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"title": "Belajar Laravel", "description": "Fokus ke API Resources"}'
```

### Contoh response sukses

```json
{
  "success": true,
  "message": "Tugas berhasil dibuat.",
  "data": {
    "id": 1,
    "title": "Belajar Laravel",
    "description": "Fokus ke API Resources",
    "is_completed": false,
    "created_at": "2025-01-01T10:00:00.000000Z",
    "updated_at": "2025-01-01T10:00:00.000000Z"
  }
}
```

---

## Variabel Environment

### Frontend — `todo-app/.env.local`

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `VITE_API_URL` | ✅ | Base URL backend, contoh: `http://127.0.0.1:8000/api` |

### Backend — `tomtech/.env`

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `APP_KEY` | ✅ | Di-generate otomatis via `php artisan key:generate` |
| `DB_CONNECTION` | ✅ | `mysql` atau `sqlite` |
| `DB_DATABASE` | ✅ | Nama database |
| `DB_USERNAME` | ✅ | Username database |
| `DB_PASSWORD` | — | Password database (boleh kosong untuk dev) |

---

## Struktur Folder

```
todo-app/
├── src/
│   ├── hooks/
│   │   └── useTasks.ts       # Logic fetch & state management
│   ├── types.ts               # TypeScript interfaces
│   └── App.tsx                # Komponen utama
├── .env.example
└── .env.local                 

tomtech/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── TaskController.php
│   │   └── Requests/
│   │       ├── StoreTaskRequest.php
│   │       └── UpdateTaskRequest.php
│   └── Models/
│       └── Task.php
├── database/migrations/
├── routes/api.php
├── .env.example
└── .env                      
```

---

## Troubleshooting

**CORS error di browser**

Buka `tomtech/config/cors.php` dan pastikan `allowed_origins` mencakup URL frontend:

```php
'allowed_origins' => ['http://localhost:5173'],
```
